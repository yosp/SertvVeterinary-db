'use-strict'

const test = require('ava')
const uuid = require('uuid-base62')
const r = require('rethinkdb')
const Db = require('../')
const fixtures = require('./fixtures')
const utils = require('../lib/utils')

test.beforeEach('setup database', async t => {
  let id = uuid.v4()
  const dbName = `veterinaria_${id}`
  const db = new Db({db: dbName, setup: true})
  await db.connect()
  t.context.db = db
  t.context.dbName = dbName
  t.true(db.connected, 'should be connected')
})

test.afterEach.always('cleanup database', async t => {
  let db = t.context.db
  let dbName = t.context.dbName
  await db.disconnect()
  t.false(db.connected, 'should be disconnected')
  let conn = await r.connect({})
  await r.dbDrop(dbName).run(conn)
})

test('save client', async t => {
  let db = t.context.db
  t.is(typeof db.saveClient, 'function', 'saveClient is a function')
  let client = fixtures.getClient()
  let created = await db.saveClient(client)
  t.is(created.fullname, client.fullname)
  t.is(created.gender, client.gender)
  t.is(created.direction, client.direction)
  t.is(created.email, client.email)
  t.is(created.phone, client.phone)
  t.is(created.phone2, client.phone2)
  t.truthy(created.createdAt)
  t.truthy(created.id)
})

test('save Ethnicities', async t => {
  let db = t.context.db
  t.is(typeof db.saveEthnicities, 'function', 'saveEthnicities is a function')
  let ethni = fixtures.getEthnicities()
  let created = await db.saveEthnicities(ethni)
  t.is(created.description, ethni.description)
  t.truthy(created.createdAt)
  t.truthy(created.id)
})

test('save laboratory', async t => {
  let db = t.context.db
  t.is(typeof db.saveLaboratory, 'function', 'saveLaboratory is a function')
  let laboratory = fixtures.getLaboratory()
  let created = await db.saveLaboratory(laboratory)
  t.is(created.description, laboratory.description)
  t.truthy(created.createdAt)
  t.truthy(created.id)
})

test('save medicine', async t => {
  let db = t.context.db
  let laboratory = fixtures.getLaboratory()
  let createdLab = await db.saveLaboratory(laboratory)
  t.is(typeof db.saveMedicine, 'function', 'saveMedicine is a function')
  let medicine = fixtures.getMedicine()
  medicine.laboratoryId = createdLab.id
  let created = await db.saveMedicine(medicine)
  t.is(created.description, medicine.description)
  t.is(created.laboratoryId, createdLab.id)
  t.truthy(created.createdAt)
  t.truthy(created.id)
})

test('save Races', async t => {
  let db = t.context.db
  let ethni = fixtures.getEthnicities()
  let createEthni = await db.saveEthnicities(ethni)
  ethni.id = createEthni.id
  t.is(typeof db.saveRace, 'function', 'saveRace is a function')
  let race = fixtures.getRace()
  race.ethniId = ethni.id
  let created = await db.saveRace(race)
  t.is(created.description, race.description)
  t.is(created.ethniId, ethni.id)
  t.truthy(created.createdAt)
  t.truthy(created.id)
})

test('save new Pet', async t => {
  let db = t.context.db
  let client = fixtures.getClient()
  let createdClient = await db.saveClient(client)
  client.id = createdClient.id
  let ethni = fixtures.getEthnicities()
  let createEthni = await db.saveEthnicities(ethni)
  ethni.id = createEthni.id
  let race = fixtures.getRace()
  let createdRace = await db.saveRace(race, ethni.id)
  race.id = createdRace.id

  let pet = fixtures.getPet()
  pet.owner = client.id
  pet.raceId = race.id
  t.is(typeof db.savePet, 'function', 'savePet is a function')

  let created = await db.savePet(pet)
  t.is(created.fullname, pet.fullname)
  t.is(created.sex, pet.sex)
  t.is(created.age, 1.1)
  t.is(created.weight, pet.weight)
  t.is(created.alive, pet.alive)
  t.is(created.photo, pet.photo)
  t.is(created.owner, createdClient.id)
  t.is(created.raceId, createdRace.id)
  t.truthy(created.createdAt)
  t.truthy(created.id)
})

test('save pet images', async t => {
  let db = t.context.db
  let image = fixtures.getImage()
  t.is(typeof db.savePetImage, 'function', 'savePetImage is a function')
  let result = await db.savePetImage(image)
  t.truthy(result.createdAt)
  t.is(result.petid, image.petid)
  t.is(result.url, image.url)
  t.truthy(result.id)
})

test('save appointment', async t => {
  let db = t.context.db

  let appointment = fixtures.getAppoitment()
  let pet = fixtures.getPet()

  t.is(typeof db.savePet, 'function', 'savePet is a function')
  let created = await db.savePet(pet)
  appointment.petid = created.id

  t.is(typeof db.saveAppointment, 'function', 'saveAppointment is a function')
  let result = await db.saveAppointment(appointment)
  t.is(result.petid, appointment.petid)
  t.truthy(result.id)
  t.truthy(result.createdAt)
})

test('save interecord', async t => {
  let db = t.context.db

  let intRecord = fixtures.getInterRecord()
  t.is(typeof db.saveInterecord, 'function', 'saveInterecord is a function')
  let result = await db.saveInterecord(intRecord)
  t.is(result.appointid, intRecord.appointid)
  t.truthy(result.id)
  t.truthy(result.createdAt)
})

test('save internment', async t => {
  let db = t.context.db

  let internment = fixtures.getInterment()
  t.is(typeof db.saveInternment, 'function', 'saveInternment is a function')
  let result = await db.saveInternment(internment)
  t.truthy(result.id)
  t.truthy(result.createdAt)
})

test('save apRecord', async t => {
  let db = t.context.db
  let record = {
    apId: uuid.v4(),
    medicineId: uuid.v4()
  }
  t.is(typeof db.saveApRecord, 'function', 'saveApRecord is a function')
  let result = await db.saveApRecord(record)
  t.is(result.apId, record.apId)
  t.is(result.medicineId, record.medicineId)
  t.truthy(result.createdAt)
  t.truthy(result.id)
})

test('save products', async t => {
  let db = t.context.db
  let product = fixtures.getProduct()

  t.is(typeof db.saveProduct, 'function', 'saveProduct is a function')
  let result = await db.saveProduct(product)
  t.truthy(result.id)
  t.truthy(result.createdAt)
})

test('save bill', async t => {
  let db = t.context.db
  let bill = fixtures.getBill()

  t.is(typeof db.saveBills, 'function', 'saveBills is function')
  let result = await db.saveBills(bill)
  t.truthy(result.id)
  t.truthy(result.createdAt)
})

test('save billDetail', async t => {
  let db = t.context.db
  let detail = fixtures.getBillDetail()
  let product = fixtures.getProduct()
  detail.billid = uuid.v4()
  let pr = await db.saveProduct(product)
  detail.productId = pr.id
  t.is(typeof db.saveBillDetail, 'function', 'saveBillDetail is a function')
  let result = await db.saveBillDetail(detail)
  t.truthy(result.id)
  t.truthy(result.createdAt)
})

test('save user', async t => {
  let db = t.context.db
  let user = fixtures.getUser()

  t.is(typeof db.saveNewUser, 'function', 'saveNewUser is a function')
  let result = await db.saveNewUser(user)
  t.truthy(user.id, result.id)
  t.truthy(user.createdAt, result.createdAt)
  t.truthy(utils.encrypt(user.password), result.password)
})

test('update client', async t => {
  let db = t.context.db
  t.is(typeof db.updateClient, 'function', 'updateClient is a function')
  let client = fixtures.getClient()
  await db.saveClient(client)

  client.phone = '809-414-3344'
  client.phone2 = '809-926-6545'
  client.direction = 'calle 2da #338'

  let updated = await db.updateClient(client)
  t.is(updated.direction, client.direction)
  t.is(updated.email, client.email)
  t.is(updated.phone, client.phone)
  t.is(updated.phone2, client.phone2)
})

test('update user', async t => {
  let db = t.context.db
  let user = fixtures.getUser()
  let result = await db.saveNewUser(user)
  t.is(typeof db.updateUser, 'function', 'updateUser is a function')
  result.fullname = 'Yeison Segura Plasecio'
  let updated = await db.updateUser(result)
  t.truthy(result.fullname, updated.fullname)
})

test('user auth', async t => {
  let db = t.context.db
  let user = fixtures.getUser()
  await db.saveNewUser(user)
  t.is(typeof db.authenticate, 'function', 'authenticate is a function')
  let auth = await db.authenticate(user.username, 'Tinton1234')
  t.truthy(auth, true)
})

test('update internment', async t => {
  let db = t.context.db
  t.is(typeof db.updateInternment, 'function', 'updateInternment is a function')
  let internment = fixtures.getInterment()
  await db.saveInternment(internment)
  internment.description = 'A no fue un error'
  let result = await db.updateInternment(internment)
  t.is(result.description, internment.description)
})

test('update appointment', async t => {
  let db = t.context.db
  let appointment = fixtures.getAppoitment()
  let pet = fixtures.getPet()
  t.is(typeof db.savePet, 'function', 'savePet is a function')
  let created = await db.savePet(pet)
  appointment.petid = created.id
  await db.saveAppointment(appointment)
  t.is(typeof db.updateAppointment, 'function', 'updateAppointment is a function')
  appointment.petAge = utils.calAge(created.borndate)
  appointment.petweight = '55'
  appointment.status = 'C'
  let result = await db.updateAppointment(appointment)
  t.is(result.petid, appointment.petid)
  t.is(result.petweight, appointment.petweight)
  t.truthy(result.id)
  t.truthy(result.createdAt)
})

test('update products', async t => {
  let db = t.context.db
  let product = fixtures.getProduct()
  let result = await db.saveProduct(product)
  t.is(typeof db.updateProducts, 'function', 'updateProducts is a function')
  result.description = 'bonabit'
  let updated = await db.updateProducts(result)
  t.is(updated.description, result.description)
})

test('update apRecord', async t => {
  let db = t.context.db
  let record = {
    description: 'todo bien, se aplico la vacuna desparacitadora',
    apId: uuid.v4(),
    medicineId: uuid.v4()
  }
  t.is(typeof db.saveApRecord, 'function', 'saveApRecord is a function')
  await db.saveApRecord(record)

  record.description = 'todo bien, se aplico la vacuna anti-rabica'
  let saved = await db.updateApRecord(record)
  t.is(record.description, saved.description)
})

test('update race', async t => {
  let db = t.context.db
  let ethni = fixtures.getEthnicities()
  let createEthni = await db.saveEthnicities(ethni)
  ethni.id = createEthni.id
  let race = fixtures.getRace()
  race.ethniId = ethni.id
  let created = await db.saveRace(race)
  t.is(typeof db.updateRace, 'function', 'updateRace is a function')
  race.id = created.id
  race.description = 'Labrador'
  let updated = await db.updateRace(race)
  t.is(updated.id, race.id)
  t.is(updated.description, race.description)
})

test('update Ethnicities', async t => {
  let db = t.context.db
  let ethni = fixtures.getEthnicities()
  let created = await db.saveEthnicities(ethni)
  t.is(typeof db.updateEthnicities, 'function', 'updateEthnicities is a function')
  ethni.id = created.id
  ethni.description = 'Gatos'
  let updated = await db.updateEthnicities(ethni)
  t.is(updated.id, ethni.id)
  t.is(updated.description, ethni.description)
})

test('update Laboratory', async t => {
  let db = t.context.db
  let laboratory = fixtures.getLaboratory()
  let created = await db.saveLaboratory(laboratory)
  t.is(typeof db.updateLaboratory, 'function', 'updateLaboratory is a function')
  laboratory.id = created.id
  laboratory.description = 'amadita'
  let updated = await db.updateLaboratory(laboratory)
  t.is(updated.id, laboratory.id)
  t.is(updated.description, laboratory.description)
})

test('update medicine', async t => {
  let db = t.context.db
  let laboratory = fixtures.getLaboratory()
  let createdLab = await db.saveLaboratory(laboratory)
  let medicine = fixtures.getMedicine()
  medicine.laboratoryId = createdLab.id
  let created = await db.saveMedicine(medicine)
  t.is(typeof db.updateMedicine, 'function', 'updateMedicine is a function')
  medicine.id = created.id
  medicine.description = 'Bonabid'
  let updated = await db.updateMedicine(medicine)
  t.is(updated.id, medicine.id)
  t.is(updated.description, medicine.description)
})

test('update interecord', async t => {
  let db = t.context.db
  let intRecord = fixtures.getInterRecord()
  let result = await db.saveInterecord(intRecord)
  t.is(typeof db.updateInterecord, 'function', 'updateInterecord is a function')

  result.description = 'Vacuna para tratar la fiebre A1'
  let updated = await db.updateInterecord(result)
  t.is(result.id, updated.id)
  t.is(result.description, updated.description)
})

test('update bills', async t => {
  let db = t.context.db
  let bill = fixtures.getBill()
  let result = await db.saveBills(bill)

  t.is(typeof db.updateBill, 'function', 'updateBill is a function')

  result.note = 'note is no requiere'
  let updated = await db.updateBill(result)
  t.is(result.id, updated.id)
  t.is(result.note, updated.note)
})

test('update billDetail', async t => {
  let db = t.context.db
  let detail = fixtures.getBillDetail()
  let product = fixtures.getProduct()
  let prvAmount = detail.amount
  detail.billid = uuid.v4()
  let pr = await db.saveProduct(product)
  detail.productId = pr.id
  await db.saveBillDetail(detail)
  t.is(typeof db.updateBillDatail, 'function', 'updateBillDatail is a function')
  detail.amount = 5
  let updated = await db.updateBillDatail(detail, prvAmount)
  detail.subPrice = 100
  t.is(detail.amount, updated.amount)
  t.is(detail.subPrice, updated.subPrice)
})

test('get internment', async t => {
  let db = t.context.db
  t.is(typeof db.getInternment, 'function', 'getInternment is a function')
  let internment = fixtures.getInterment()
  internment.petid = uuid.v4()
  await db.saveInternment(internment)
  let result = await db.getInternment(internment.petid)
  t.is(result[0].description, internment.description)
  t.is(result[0].petid, internment.petid)
})

test('get client list', async t => {
  let db = t.context.db
  let clients = fixtures.getListClients(3)
  let saveClient = clients.map(cli => db.saveClient(cli))
  t.is(typeof db.getClientList, 'function', 'getClientList is a function')
  let created = await Promise.all(saveClient)
  let result = await db.getClientList()
  t.is(created.length, result.length)
})

test('get billDetail', async t => {
  let db = t.context.db
  let billid = uuid.v4()
  let detail = fixtures.getListBillDetail()

  detail.map(det => {
    det.billid = billid
  })

  detail.map(det => db.saveBillDetail(det))
  let created = await Promise.all(detail)
  t.is(typeof db.getBillDetail, 'function', 'getBillDetail is a function')
  let result = await db.getBillDetail(billid)
  t.is(created.length, result.length)
})

test('get client data by phone', async t => {
  let db = t.context.db
  t.is(typeof db.getClientByPhone, 'function', 'getClientByPhone is a function')
  let client = fixtures.getClient()
  let created = await db.saveClient(client)
  let result = await db.getClientByPhone(created.phone)
  t.deepEqual(created.phone, result[0].phone)
  t.throws(db.getClient('foo'), /not found/)
})

test('get client data by email', async t => {
  let db = t.context.db
  t.is(typeof db.getClientByEmail, 'function', 'getClientByEmail is a function')
  let client = fixtures.getClient()
  let created = await db.saveClient(client)
  let result = await db.getClientByEmail(created.email)
  t.deepEqual(created.length, result.length)
  t.throws(db.getClient('foo'), /not found/)
})

test('get pets by client', async t => {
  let db = t.context.db
  let petsList = fixtures.getListPets(2)
  let client = fixtures.getClient()
  let createdClient = await db.saveClient(client)
  client.id = createdClient.id
  let ethni = fixtures.getEthnicities()
  let createEthni = await db.saveEthnicities(ethni)
  ethni.id = createEthni.id
  let race = fixtures.getRace()
  let createdRace = await db.saveRace(race, ethni.id)
  race.id = createdRace.id
  petsList.map(p => {
    p.owner = client.id
    p.raceId = race.id
  })
  t.is(typeof db.getPetsByClient, 'function', 'getPetsByClient is a funtion')
  let savedPets = petsList.map(p => db.savePet(p))
  let created = await Promise.all(savedPets)
  let result = await db.getPetsByClient(client.id)
  t.is(created.length, result.length)
})

test('get Races', async t => {
  let db = t.context.db
  let races = fixtures.getListRaces(3)
  let ethni = fixtures.getEthnicities()
  let createEthni = await db.saveEthnicities(ethni)
  ethni.id = createEthni.id
  races.map(r => {
    r.ethniId = ethni.id
  })
  let savedRaces = races.map(race => db.saveRace(race))
  t.is(typeof db.getRaceByEthni, 'function', 'getRaceByEthni is a function')
  let createds = await Promise.all(savedRaces)
  let result = await db.getRaceByEthni(ethni.id)
  t.is(createds.length, result.length)
})

test('get Ethnicities', async t => {
  let db = t.context.db
  let ethnis = fixtures.getListEtnis(5)
  let savedEthnis = ethnis.map(et => db.saveEthnicities(et))
  t.is(typeof db.getEthnicities, 'function', 'getEthnicities is a function')
  let createds = await Promise.all(savedEthnis)
  let result = await db.getEthnicities()
  t.is(createds.length, result.length)
})

test('get laboratory', async t => {
  let db = t.context.db
  let laboratory = fixtures.getListLaboratory(5)
  let savedLabs = laboratory.map(et => db.saveLaboratory(et))
  t.is(typeof db.getLaboratorys, 'function', 'getLaboratorys is a function')
  let createds = await Promise.all(savedLabs)
  let result = await db.getLaboratorys()
  t.is(createds.length, result.length)
})

test('get apRecord', async t => {
  let db = t.context.db
  let record = {
    apId: uuid.v4(),
    medicineId: uuid.v4()
  }
  await db.saveApRecord(record)
  t.is(typeof db.getApRecord, 'function', 'getApRecord is a function')
  let created = await db.getApRecord(record.apId)
  t.is(created.length, 1)
})

test('get Medicines', async t => {
  let db = t.context.db
  let medicines = fixtures.getListMedicines(3)
  medicines.map(m => {
    m.laboratoryId = 1
  })
  let savedMedicine = medicines.map(medicine => db.saveMedicine(medicine))
  t.is(typeof db.getMedicineByLab, 'function', 'getMedicineByLab is a function')
  let createds = await Promise.all(savedMedicine)
  let result = await db.getMedicineByLab(1)
  t.is(createds.length, result.length)
})

test('get petsImages', async t => {
  let db = t.context.db
  let images = fixtures.getListPetsImages(5)
  let saveImages = images.map(img => db.savePetImage(img))
  let created = await Promise.all(saveImages)
  let result = await db.getPetImages()

  t.is(created.length, result.length)
})

test('get appointment', async t => {
  let db = t.context.db
  let appointments = fixtures.getListAppointments(2)
  let savedApp = appointments.map(a => db.saveAppointment(a))
  t.is(typeof db.getAppointments, 'function', 'getAppointments is function')
  let createds = await Promise.all(savedApp)
  let result = await db.getAppointments()
  t.is(result.length, createds.length)
})

test('get bill', async t => {
  let db = t.context.db
  let bill = fixtures.getBill()

  let saved = await db.saveBills(bill)
  t.is(typeof db.getBill, 'function', 'getBill is a function')
  let getedBill = await db.getBill(saved.id)
  t.is(saved.id, getedBill.id)
  t.is(saved.note, getedBill.note)
})

test('get bill by dates', async t => {
  let db = t.context.db
  let bill = fixtures.getListBills(5)

  let dateA = new Date('10/01/2016')
  let dateB = new Date('11/30/2016')
  let saved = bill.map(b => db.saveBills(b))
  let createds = await Promise.all(saved)
  t.is(typeof db.getBillByDate, 'function', 'getBillByDate is a function')
  let getedBill = await db.getBillByDate(dateA, dateB)
  t.is(getedBill.length, createds.length)
})

test('get appointment by pet', async t => {
  let db = t.context.db
  let appointments = fixtures.getListAppointments(2)
  let pet = uuid.v4()
  appointments.map(a => {
    a.petid = pet
  })
  let savedApp = appointments.map(a => db.saveAppointment(a))
  let aps = fixtures.getListAppointments(3)
  aps.map(a => {
    a.petid = 2121
  })
  let saved2 = aps.map(a => db.saveAppointment(a))

  t.is(typeof db.getAppointmentByPet, 'function', 'getAppointmentByPet is function')
  let createds = await Promise.all(savedApp)
  let createds2 = await Promise.all(saved2)
  let result = await db.getAppointmentByPet(pet)
  t.is(result.length, createds.length)
  t.is(createds2.length, 3)
})

test('get products by name', async t => {
  let db = t.context.db
  let product = fixtures.getProduct()
  let result = await db.saveProduct(product)
  t.is(typeof db.getProducts, 'function', 'getProducts is a function')

  let prget = await db.getProducts(result.description)
  t.is(prget[0].description, result.description)
  t.is(prget[0].stock, result.stock)
  t.is(prget[0].price, result.price)
  t.is(prget[0].cost, result.cost)
  t.truthy(prget[0].id)
})

test('get interecord by internment', async t => {
  let db = t.context.db
  let interecord = fixtures.getListInterRecord()
  let internid = uuid.v4()
  interecord.map(a => {
    a.internid = internid
  })

  let saved = interecord.map(a => db.saveInterecord(a))
  t.is(typeof db.getInterecord, 'function', 'getInterecord is a function')
  let created = await Promise.all(saved)
  let result = await db.getInterecord(internid)

  t.is(result.length, created.length)
})
