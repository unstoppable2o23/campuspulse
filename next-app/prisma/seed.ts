import { PrismaClient } from "@prisma/client";
import { COUNTRIES } from "../data/countries";
import { INDIAN_STATES } from "../data/india";

const prisma = new PrismaClient();

async function main() {
  for (const c of COUNTRIES) {
    await prisma.country.upsert({
      where: { code: c.code },
      update: { name: c.name, nationality: c.nationality, dialCode: c.dialCode, flag: c.flag },
      create: { code: c.code, name: c.name, nationality: c.nationality, dialCode: c.dialCode, flag: c.flag },
    });
  }
  for (const s of INDIAN_STATES) {
    const state = await prisma.state.upsert({
      where: { countryCode_code: { countryCode: "IN", code: s.code } },
      update: { name: s.name },
      create: { countryCode: "IN", code: s.code, name: s.name },
    });
    for (const d of s.districts) {
      const code = d.toUpperCase().replace(/[^A-Z0-9]+/g, "_").slice(0, 40);
      await prisma.district.upsert({
        where: { countryCode_stateCode_code: { countryCode: "IN", stateCode: s.code, code } },
        update: { name: d },
        create: { countryCode: "IN", stateCode: s.code, stateId: state.id, code, name: d },
      });
    }
  }
  console.log(`seeded ${COUNTRIES.length} countries, ${INDIAN_STATES.length} Indian states/UTs`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
