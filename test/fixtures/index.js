'use strict'
const uuid = require('uuid-base62')

const fixtures = {
  getClient () {
    return {
      fullname: 'Yeison Segura',
      gender: 'Hombre',
      direction: 'Calle 1ra #4',
      email: 'yeisp1011@gmail.com',
      phone: '809-414-8433',
      phone2: '829-926-6545'
    }
  },

  getImage () {
    return {
      url: 'http://perros.mascotahogar.com/Imagenes/cachorro-de-husky-siberiano.jpg',
      petid: uuid.v4()
    }
  },

  getProduct () {
    return {
      description: 'Bonabid',
      stock: 8,
      cost: 100,
      price: 180
    }
  },

  getInterRecord () {
    return {
      description: 'Vacuna para tratar la fiebre',
      medicineId: 21212,
      appointid: uuid.v4()
    }
  },

  getAppoitment () {
    return {
      description: 'Vacunacion de parasitos',
      appointmentDate: '07/24/2015',
      status: 'A'
    }
  },

  getInterment () {
    return {
      petid: uuid.v4(),
      description: 'Pasiente con fiebre',
      internDate: new Date(),
      status: 'A'
    }
  },

  getEthnicities () {
    return {
      description: 'Perros'
    }
  },

  getRace () {
    return {
      description: 'Husky'
    }
  },

  getLaboratory () {
    return {
      description: 'Laboratorio General'
    }
  },

  getMedicine () {
    return {
      description: 'Pulgoso'
    }
  },

  getPet () {
    return {
      fullname: 'Eli Segura',
      sex: 'H',
      color: 'Blanco, Gris, Negro',
      borndate: '01/25/2015',
      weight: '45',
      alive: true,
      photo: 'http://localhost/servtvVeterinary/pet/photos/10202121.jpg'
    }
  },

  getListPetsImages (n) {
    let images = []
    while (n-- > 0) {
      images.push(this.getImage())
    }

    return images
  },

  getListClients (n) {
    let clients = []
    while (n-- > 0) {
      clients.push(this.getClient())
    }

    return clients
  },

  getListAppointments (n) {
    let ap = []
    while (n-- > 0) {
      ap.push(this.getAppoitment())
    }

    return ap
  },

  getListPets (n) {
    let pets = []
    while (n-- > 0) {
      pets.push(this.getPet())
    }

    return pets
  },

  getListLaboratory (n) {
    let labs = []
    while (n-- > 0) {
      labs.push(this.getLaboratory())
    }

    return labs
  },

  getListMedicines (n) {
    let meds = []
    while (n-- > 0) {
      meds.push(this.getMedicine())
    }

    return meds
  },

  getListInterRecord (n) {
    let intrec = []
    while (n-- > 0) {
      intrec.push(this.getInterRecord())
    }
    return intrec
  },

  getListRaces (n) {
    let races = []
    while (n-- > 0) {
      races.push(this.getRace())
    }

    return races
  },

  getListEtnis (n) {
    let ethnis = []
    while (n-- > 0) {
      ethnis.push(this.getEthnicities())
    }

    return ethnis
  }

}

module.exports = fixtures
