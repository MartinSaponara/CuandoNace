import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const defaultPassword = 'santiago2026'
  await prisma.setting.upsert({
    where: { id: 'global' },
    update: {},
    create: { id: 'global', adminPassword: defaultPassword },
  })
  console.log('OK: Setting creado con password admin por defecto:', defaultPassword)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
