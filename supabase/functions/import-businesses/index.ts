import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OutscraperBusiness {
  name: string
  place_id?: string
  phone?: string
  website?: string
  full_address?: string
  city?: string
  rating?: number
  reviews?: number
  latitude?: number
  longitude?: number
  working_hours?: Record<string, string>
  category?: string
  categories?: string[]
  description?: string
}

interface ImportResult {
  success: boolean
  businessName: string
  action: 'created' | 'updated' | 'skipped'
  error?: string
  cityMatched?: string
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/é/g, 'e')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
}

function normalizeCity(cityName: string): string {
  return cityName
    .toLowerCase()
    .trim()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { businesses, serviceId, createFeaturedSlots = true } = await req.json()

    if (!businesses || !Array.isArray(businesses)) {
      return new Response(
        JSON.stringify({ error: 'businesses must be an array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!serviceId) {
      return new Response(
        JSON.stringify({ error: 'serviceId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify service exists
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id, name')
      .eq('id', serviceId)
      .maybeSingle()

    if (serviceError || !service) {
      return new Response(
        JSON.stringify({ error: 'Service not found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch all cities for matching
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('id, name, slug')

    if (citiesError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch cities' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create city lookup map (normalized name -> city)
    const cityMap = new Map<string, { id: string; name: string; slug: string }>()
    for (const city of cities || []) {
      cityMap.set(normalizeCity(city.name), city)
      // Also add slug as a key
      cityMap.set(city.slug, city)
    }

    const results: ImportResult[] = []
    const citiesWithNewBusinesses = new Set<string>()

    for (const business of businesses as OutscraperBusiness[]) {
      try {
        // Validate required fields
        if (!business.name) {
          results.push({
            success: false,
            businessName: 'Unknown',
            action: 'skipped',
            error: 'Missing business name'
          })
          continue
        }

        // Match city
        let matchedCity: { id: string; name: string; slug: string } | undefined
        if (business.city) {
          const normalizedInputCity = normalizeCity(business.city)
          matchedCity = cityMap.get(normalizedInputCity)
          
          // Try partial match if exact match fails
          if (!matchedCity) {
            for (const [key, city] of cityMap) {
              if (normalizedInputCity.includes(key) || key.includes(normalizedInputCity)) {
                matchedCity = city
                break
              }
            }
          }
        }

        if (!matchedCity) {
          results.push({
            success: false,
            businessName: business.name,
            action: 'skipped',
            error: `City not found: ${business.city || 'not provided'}`
          })
          continue
        }

        // Prepare business data
        const slug = generateSlug(business.name)
        const businessData = {
          name: business.name,
          slug,
          gbp_id: business.place_id || null,
          phone: business.phone || null,
          website: business.website || null,
          address: business.full_address || null,
          city_id: matchedCity.id,
          rating: business.rating || null,
          review_count: business.reviews || 0,
          lat: business.latitude || null,
          lng: business.longitude || null,
          opening_hours: business.working_hours || null,
          categories: business.categories || (business.category ? [business.category] : null),
          description: business.description || null,
          is_active: true,
          verified: false
        }

        // Upsert business (update if gbp_id exists, insert otherwise)
        let businessId: string
        let action: 'created' | 'updated' = 'created'

        if (business.place_id) {
          // Check if business with this gbp_id exists
          const { data: existingBusiness } = await supabase
            .from('businesses')
            .select('id')
            .eq('gbp_id', business.place_id)
            .maybeSingle()

          if (existingBusiness) {
            // Update existing
            const { data: updated, error: updateError } = await supabase
              .from('businesses')
              .update(businessData)
              .eq('id', existingBusiness.id)
              .select('id')
              .single()

            if (updateError) throw updateError
            businessId = updated.id
            action = 'updated'
          } else {
            // Insert new
            const { data: inserted, error: insertError } = await supabase
              .from('businesses')
              .insert(businessData)
              .select('id')
              .single()

            if (insertError) throw insertError
            businessId = inserted.id
          }
        } else {
          // No gbp_id, always insert (might create duplicates)
          const { data: inserted, error: insertError } = await supabase
            .from('businesses')
            .insert(businessData)
            .select('id')
            .single()

          if (insertError) throw insertError
          businessId = inserted.id
        }

        // Create business_service_coverage entry
        const { error: coverageError } = await supabase
          .from('business_service_coverage')
          .upsert({
            business_id: businessId,
            service_id: serviceId,
            city_id: matchedCity.id,
            is_primary: true
          }, {
            onConflict: 'business_id,service_id,city_id'
          })

        if (coverageError) {
          console.error('Coverage error:', coverageError)
        }

        // Create a page entry for the business profile
        const pageRoute = `/${service.name.toLowerCase().replace(/[åä]/g, 'a').replace(/ö/g, 'o').replace(/[^a-z0-9]+/g, '-')}/${matchedCity.slug}/${slug}`
        const { error: pageError } = await supabase
          .from('pages')
          .upsert({
            route: pageRoute,
            title: `${business.name} - ${service.name} i ${matchedCity.name}`,
            meta_description: business.description ? 
              business.description.substring(0, 155) : 
              `${business.name} erbjuder ${service.name.toLowerCase()} i ${matchedCity.name}. Se omdömen, kontaktuppgifter och öppettider.`,
            h1: business.name,
            noindex: false
          }, {
            onConflict: 'route'
          })

        if (pageError) {
          console.error('Page creation error:', pageError)
        }

        citiesWithNewBusinesses.add(matchedCity.id)

        results.push({
          success: true,
          businessName: business.name,
          action,
          cityMatched: matchedCity.name
        })

      } catch (error) {
        console.error('Error processing business:', error)
        results.push({
          success: false,
          businessName: business.name || 'Unknown',
          action: 'skipped',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Create placeholder featured slots for cities that don't have one
    if (createFeaturedSlots && citiesWithNewBusinesses.size > 0) {
      for (const cityId of citiesWithNewBusinesses) {
        // Check if featured slot already exists for this city/service
        const { data: existingSlot } = await supabase
          .from('featured_slots')
          .select('id')
          .eq('city_id', cityId)
          .eq('service_id', serviceId)
          .eq('status', 'active')
          .maybeSingle()

        if (!existingSlot) {
          // Get a random business from this city/service
          const { data: randomBusiness } = await supabase
            .from('business_service_coverage')
            .select('business_id')
            .eq('city_id', cityId)
            .eq('service_id', serviceId)
            .limit(1)
            .maybeSingle()

          if (randomBusiness) {
            await supabase
              .from('featured_slots')
              .insert({
                city_id: cityId,
                service_id: serviceId,
                business_id: randomBusiness.business_id,
                status: 'active',
                is_placeholder: true
              })
          }
        }
      }
    }

    const summary = {
      total: results.length,
      created: results.filter(r => r.action === 'created').length,
      updated: results.filter(r => r.action === 'updated').length,
      skipped: results.filter(r => r.action === 'skipped').length,
      citiesAffected: citiesWithNewBusinesses.size
    }

    return new Response(
      JSON.stringify({ success: true, summary, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Import error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
