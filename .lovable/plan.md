

## Rensa databasen för ny nisch

Ja, det bör absolut ingå i remix-prompten. Tack vare `ON DELETE CASCADE` på foreign keys räcker det att rensa huvudtabellerna – relaterad data tas bort automatiskt.

### Tabeller att tömma och ordning

| Tabell | Varför | Cascade-effekt |
|--------|--------|---------------|
| `businesses` | All gammal företagsdata | Tar automatiskt bort `business_reviews`, `business_service_coverage`, och nollställer `featured_slots.business_id` |
| `featured_slots` | Gamla featured-platser | – |
| `leads` | Gamla leads från förra nischen | – |
| `contact_messages` | Gamla kontaktmeddelanden | – |
| `scrape_jobs` | Gamla skrapningsjobb | – |
| `pages` | Gamla företagsprofil-sidor | – |
| `service_content` | AI-genererat innehåll för gamla tjänster | – |
| `cities` | Om nya städer ska användas | Cascade tar bort `service_content`, `business_service_coverage`, `featured_slots` |
| `services` | Om nya tjänster ska användas | Cascade tar bort `service_content`, `business_service_coverage`, `featured_slots` |

### Implementation

Jag lägger till ett SQL-block i remix-prompten som du kan köra direkt:

```sql
-- Rensa all nisch-specifik data (ordningen spelar roll)
TRUNCATE businesses CASCADE;
TRUNCATE featured_slots CASCADE;
TRUNCATE leads CASCADE;
TRUNCATE contact_messages CASCADE;
TRUNCATE scrape_jobs CASCADE;
TRUNCATE pages CASCADE;
TRUNCATE service_content CASCADE;
-- Om du byter städer/tjänster också:
TRUNCATE cities CASCADE;
TRUNCATE services CASCADE;
```

Detta tar bara 1-2 sekunder att köra och lämnar kvar `site_settings`, `user_roles` och auth-användare intakta.

### Uppdaterad remix-prompt

Jag uppdaterar den remix-prompt jag gav dig tidigare så att databasrensning ingår som steg 1 innan ny konfiguration.

