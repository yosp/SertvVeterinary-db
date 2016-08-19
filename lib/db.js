'use strict'

const co = require('co')
const r = require('rethinkdb')
const Promise = require('bluebird')
const uuid = require('uuid-base62')
const config = require('../config')
const utils = require('./utils')

const defaults = config.db;

class Db {
	constructor(options){
		options = options || {}
		this.port = options.port || defaults.port
		this.host = options.host || defaults.host
		this.db = options.db || defaults.db
		this.connected = false
		this.setup = options.setup || false
	}

	connect(callback){
		this.connection = r.connect({
			host: this.host,
			port: this.port
		})

		this.connected = true

		let db = this.db
		let connection = this.connection

		if (!this.setup) {
      		return Promise.resolve(connection).asCallback(callback)
    	}

    	let setup = co.wrap(function * (){
    		let conn = yield connection

    		let dbList = yield r.dbList().run(conn)
      		
      		if (dbList.indexOf(db) === -1) {
        		yield r.dbCreate(db).run(conn)
      		}
      		
      	let dbTables = yield r.db(db).tableList().run(conn)
		    if (dbTables.indexOf('clients') === -1) {
		    	yield r.db(db).tableCreate('clients').run(conn)
		      yield r.db(db).table('clients').indexCreate('createdAt').run(conn)
		     	// yield r.db(db).table('clients').indexCreate('userId', { multi: true }).run(conn)
		    }

	      if (dbTables.indexOf('pets') === -1) {
	        yield r.db(db).tableCreate('pets').run(conn)
	        yield r.db(db).table('pets').indexCreate('owner', { multi: true }).run(conn)
	      }

	      if (dbTables.indexOf('petsimages') === -1) {
	        yield r.db(db).tableCreate('petsimages').run(conn)
	        yield r.db(db).table('petsimages').indexCreate('petid', { multi: true }).run(conn)
	        yield r.db(db).table('petsimages').indexCreate('createdAt', { multi: true }).run(conn)
	      }

	      if (dbTables.indexOf('ethnicities') === -1){
	        yield r.db(db).tableCreate('ethnicities').run(conn)
	        yield r.db(db).table('ethnicities').indexCreate('createdAt').run(conn)
	      }

	      if (dbTables.indexOf('races') === -1){
	        yield r.db(db).tableCreate('races').run(conn)
	        yield r.db(db).table('races').indexCreate('ethniId').run(conn)
	      }

	      if (dbTables.indexOf('users') === -1){
	        yield r.db(db).tableCreate('users').run(conn)
	        yield r.db(db).table('users').indexCreate('createdAt').run(conn)
	      }

	      if (dbTables.indexOf('appointment') === -1){
	        yield r.db(db).tableCreate('appointment').run(conn)
	        yield r.db(db).table('appointment').indexCreate('petid').run(conn)
	        yield r.db(db).table('appointment').indexCreate('status').run(conn)
	        yield r.db(db).table('appointment').indexCreate('createdAt').run(conn)
	      }

	      if (dbTables.indexOf('aprecord') === -1){
	      	yield r.db(db).tableCreate('aprecord').run(conn)
	      	yield r.db(db).table('aprecord').indexCreate('apId').run(conn)
	      }

	      if (dbTables.indexOf('laboratory') === -1){
	      	yield r.db(db).tableCreate('laboratory').run(conn)
	      	yield r.db(db).table('laboratory').indexCreate('createdAt').run(conn)
	      }

	      if (dbTables.indexOf('medicine') === -1){
	      	yield r.db(db).tableCreate('medicine').run(conn)
	      	yield r.db(db).table('medicine').indexCreate('laboratoryId').run(conn)
	      	yield r.db(db).table('medicine').indexCreate('createdAt').run(conn)
	      }

	      if (dbTables.indexOf('internment') === -1){
	      	yield r.db(db).tableCreate('internment').run(conn)
	      	yield r.db(db).table('internment').indexCreate('petid').run(conn)
	      	yield r.db(db).table('internment').indexCreate('createdAt').run(conn)
	      	yield r.db(db).table('internment').indexCreate('status').run(conn)
	      }

	      if (dbTables.indexOf('interecord') === -1){
	      	yield r.db(db).tableCreate('interecord').run(conn)
	      	yield r.db(db).table('interecord').indexCreate('internid').run(conn)
	      	yield r.db(db).table('interecord').indexCreate('createdAt').run(conn)
	      }

		  	return conn

    	})

    	return Promise.resolve(setup()).asCallback(callback)
	} 

	disconnect(callback){
		if (!this.connected) {
	      return Promise.reject(new Error('not connected')).asCallback(callback)
	    }

    	this.connected = false
    	return Promise.resolve(this.connection)
      		   .then((conn) => conn.close())
	}
	// Client Section
  saveClient(client, callback){
		if (!this.connected) {
  		return Promise.reject(new Error('not connected')).asCallback(callback)
 		}

 		let connection = this.connection
 		let db = this.db

 		let task = co.wrap(function * (){
 			let conn = yield connection
 			client.createdAt = new Date()

 			let result = yield r.db(db).table('clients').insert(client).run(conn)

 			if(result.errors > 0){
 				return Promise.reject(new Error(result.first_error))
 			}
 			client.id = result.generated_keys[0]

 			// yield r.db(db).table('clients').update({
 			// 	id: uuid.encore(client.id)
 			// }).run(conn)

 			let created = yield r.db(db).table('clients').get(client.id).run(conn)

 			return Promise.resolve(created)

 		})

 		return Promise.resolve(task()).asCallback(callback)
	}

	updateClient(client, callback){
		if(!this.connected){
			return Promise.reject(new Error('not connected')).asCallback(callback)
		}

		let connection = this.connection
		let db = this.db

		let task = co.wrap(function * () {
			let conn = yield connection

			let updated = yield r.db(db).table('clients').get(client.id).update(client).run(conn)

			if(updated.errors > 0){
				return Promise.reject(new Error(updated.first_error)).asCallback(callback)
			}
			let result = yield r.db(db).table('clients').get(client.id).run(conn)

			return Promise.resolve(result)
		})

		return Promise.resolve(task()).asCallback(callback)
	}

	getClientList(callback){
		if (!this.connected){
			return Promise.reject(new Error('not connected')).asCallback(callback)
		}

		let connection = this.connection
		let db = this.db

		let task = co.wrap(function * (){
		  let conn = yield connection

		  yield r.db(db).table('clients').indexWait().run(conn)
		  let clients = yield r.db(db).table('clients').orderBy({
		  	index: r.desc('createdAt')
		  }).run(conn)
		  
		  let result = yield clients.toArray()
		  return Promise.resolve(result)
		})
		return Promise.resolve(task()).asCallback(callback)
	}

	getClient(id, callback){
		if(!this.connected){
			return Promise.reject(new Error('not connected')).asCallback(callback)
		}

		let connection = this.connection
		let db = this.db

		let task = co.wrap(function * (){
			let conn = yield connection
			let client = yield r.db(db).table('clients').get(id).run(conn)
			if(!client){
				return Promise.reject(new Error(`Client ${id}, not found`))
			}
			return Promise.resolve(client)
		})
		return Promise.resolve(task()).asCallback(callback)
	}

	getClientByPhone(phone, callback){
		if(!this.connected){
			return Promise.reject(new Error('not connected')).asCallback(callback)
		}

		let connection = this.connection
		let db = this.db

		let task = co.wrap(function * (){
			let conn = yield connection
			let client = null
			let result = yield r.db(db).table('clients').getAll(phone, {
				index: 'createdAt'
			}).run(conn)
			if(!result){
				let phone2 = phone
				let result2 = yield r.db(db).table('clients').getAll(phone2, {
					index: 'createdAt'
				}).run(conn)
				if(!result2){
					return Promise.reject(new Error(`Client ${phone2}, not found`))
				}
				client =  result2
			}else{
				client =  result
			}

			return Promise.resolve(client)
		})
		return Promise.resolve(task()).asCallback(callback)
	}

	getClientByEmail(email, callback){
		if(!this.connected){
			return Promise.reject(new Error('not connected')).asCallback(callback)
		}

		let connection = this.connection
		let db = this.db

		let task = co.wrap(function * (){
			let conn = yield connection
			let client = null
			let result = yield r.db(db).table('clients').getAll(email, {
				index: 'createdAt'
			}).run(conn)
			if(!result){
					return Promise.reject(new Error(`Client whit email: ${email}, not found`))
				}
		  
		  client =  result
			return Promise.resolve(client)
		})
		return Promise.resolve(task()).asCallback(callback)
	}
	//Internment Section
	saveInternment(internment, callback){
		if (!this.connected) {
  		return Promise.reject(new Error('not connected')).asCallback(callback)
 		}

 		let connection = this.connection
 		let db = this.db

 		let task = co.wrap(function * (){
 			let conn = yield connection
 			internment.createdAt = new Date()

 			let result = yield r.db(db).table('internment').insert(internment).run(conn)

 			if(result.errors > 0){
 				return Promise.reject(new Error(result.first_error))
 			}
 			internment.id = result.generated_keys[0]

 			let created = yield r.db(db).table('internment').get(internment.id).run(conn)

 			if(!created){
 			  return Promise.reject(new Error('no data found'))
 			}

 			return Promise.resolve(created)

 		})

 		return Promise.resolve(task()).asCallback(callback)
	}

	updateInternment(internment, callback){
		if (!this.connected) {
  		return Promise.reject(new Error('not connected')).asCallback(callback)
 		}

 		let connection = this.connection
 		let db = this.db

 		let task = co.wrap(function * (){
 			let conn = yield connection

 			let result = yield r.db(db).table('internment').update(internment).run(conn)

 			if(result.errors > 0){
 				return Promise.reject(new Error(`count error ${result.first_error}`))
 			}

 			let created = yield r.db(db).table('internment').get(internment.id).run(conn)

 			if(!created){
 			  return Promise.reject(new Error('no data found'))
 			}

 			return Promise.resolve(created)

 		})

 		return Promise.resolve(task()).asCallback(callback)
	}

	getInternment(petid, callback){
	  if(!this.connected){
	  	return	Promise.reject(new Error('not connected')).asCallback(callback)
	  }

	  let connection = this.connection
	  let db = this.db

	  let task = co.wrap(function * (){
	  	let conn = yield connection
	  	yield r.db(db).table('internment').indexWait().run(conn)
	  	let interns = yield r.db(db).table('internment').getAll(petid, {
	  		index: 'petid'
	  	}).run(conn)

	  	if(interns.errors > 0){
	  	  return Promise.reject(new Error(interns.first_error)).asCallback(callback)
	  	}

	  	if(!interns){
	  	  return Promise.reject(new Error(`not internment found for pet ${petid}`)).asCallback(callback)
	  	}

	  	let result = yield interns.toArray()
	  	return Promise.resolve(result)
	  })
	  return Promise.resolve(task()).asCallback(callback)
	}
	//Interecord Section
	saveInterecord(record, callback){
	  if (!this.connected) {
  		return Promise.reject(new Error('not connected')).asCallback(callback)
 		}

 		let connection = this.connection
 		let db = this.db

 		let task = co.wrap(function * (){
 			let conn = yield connection
 			record.createdAt = new Date()

 			let result = yield r.db(db).table('interecord').insert(record).run(conn)

 			if(result.errors > 0){
 				return Promise.reject(new Error(result.first_error))
 			}
 			record.id = result.generated_keys[0]

 			let created = yield r.db(db).table('interecord').get(record.id).run(conn)

 			if(!created){
 			  return Promise.reject(new Error('no data found'))
 			}

 			return Promise.resolve(created)

 		})

 		return Promise.resolve(task()).asCallback(callback)
	}
	//Ethnicities Section
	saveEthnicities(ethni, callback){
		if(!this.connected){
			return Promise.reject(new Error('not connected')).asCallback(callback)
		}

		let connection = this.connection
		let db = this.db

		let task = co.wrap(function * (){
			let conn = yield connection
			ethni.createdAt = new Date()

			let result = yield r.db(db).table('ethnicities').insert(ethni).run(conn)

			if(result.errors > 0){
				return Promise.reject(new Error(result.first_error))
			}

			ethni.id = result.generated_keys[0]

			let created = yield r.db(db).table('ethnicities').get(ethni.id).run(conn)

			return Promise.resolve(created)
		})

		return Promise.resolve(task()).asCallback(callback)
	}

	updateEthnicities(ethnicities, callback){
		if(!this.connected){
			return Promise.reject(new Error('not connected')).asCallback(callback)
		}

		let connection = this.connection
		let db = this.db

		let task = co.wrap(function * (){
			let conn = yield connection

			let updated = yield r.db(db).table('ethnicities').get(ethnicities.id).update(ethnicities).run(conn)
			if(updated.errors > 0){
				return Promise.reject(new Error(updated.first_error))
			}

			let result = yield r.db(db).table('ethnicities').get(ethnicities.id).run(conn)
			return Promise.resolve(result)
		})
		return Promise.resolve(task()).asCallback(callback)
	}

	getEthnicities(callback){
		if(!this.connected){
			return Promise.reject(new Error('not connected')).asCallback(callback)
		}

		let connection = this.connection
		let db = this.db

		let task = co.wrap(function * (){
			let conn = yield connection

			yield r.db(db).table('ethnicities').indexWait().run(conn)
			let ethni = yield r.db(db).table('ethnicities').orderBy({
				index: r.desc('createdAt')
			}).run(conn)

			let result = yield ethni.toArray()
			return Promise.resolve(result)
		})

		return Promise.resolve(task()).asCallback(callback)
	}
	//Laboratory Section
	saveLaboratory(lab, callback){
		if(!this.connected){
			return Promise.reject(new Error('not connected').asCallback(callback))
		}

		let connection = this.connection
		let db = this.db

		let task = co.wrap(function * () {
			let conn = yield connection
			lab.createdAt = new Date()
			let result = yield r.db(db).table('laboratory').insert(lab).run(conn)

			if( result.errors > 0){
				return Promise.reject(new Error(result.first_error)).asCallback(callback)
			}

			lab.id = result.generated_keys[0]

			let created = r.db(db).table('laboratory').get(lab.id).run(conn)

			return Promise.resolve(created)
		})

		return Promise.resolve(task()).asCallback(callback)
	}

	updateLaboratory(laboratory, callback){
		if(!this.connected){
			return Promise.reject(new Error('not connected')).asCallback(callback)
		}

		let connection = this.connection
		let db = this.db

		let task = co.wrap(function * (){
			let conn = yield connection

			let updated = yield r.db(db).table('laboratory').get(laboratory.id).update(laboratory).run(conn)

			if(updated.errors > 0){
				return Promise.reject(new Error(update.first_error)).asCallback(callback)
			}
			let result = yield r.db(db).table('laboratory').get(laboratory.id).run(conn)
			return Promise.resolve(result)
		})
		return Promise.resolve(task()).asCallback(callback)
	}

	getLaboratorys(callback){
		if(!this.connected){
			return Promise.reject(new Error('not connected')).asCallback(callback)
		}

		let connection = this.connection
		let db = this.db

		let task = co.wrap(function * (){
			let conn = yield connection

			yield r.db(db).table('laboratory').indexWait().run(conn)
			let lab = yield r.db(db).table('laboratory').orderBy({
				index: r.desc('createdAt')
			}).run(conn)
			
			let result = yield lab.toArray()
			return Promise.resolve(result)
		})
		return Promise.resolve(task()).asCallback(callback)
	}
	//Race Section
	saveRace(race, callback){
		if(!this.connected){
			return Promise.reject(new Error('not connected')).asCallback(callback)
		}

		let connection = this.connection
		let db = this.db

		let task = co.wrap(function * (){
			let conn = yield connection
			race.createdAt = new Date()

			let result = yield r.db(db).table('races').insert(race).run(conn)

			if(result.errors > 0){
				return Promise.reject(new Error(result.first_error))
			}
			race.id = result.generated_keys[0]

			let created = yield r.db(db).table('races').get(race.id).run(conn)

			return Promise.resolve(created)
		})
		return Promise.resolve(task()).asCallback(callback)
	}

	updateRace(race, callback) {
		if(!this.connected){
			return Promise.reject(new Error('not connected')).asCallback(callback)
		}

		let connection = this.connection
		let db = this.db

		let task = co.wrap(function * (){
			let conn = yield connection

			let updated = yield r.db(db).table('races').get(race.id).update(race).run(conn)

			if(updated.errors> 0){
				return Promise.reject(new Error(update.first_error)).asCallback(callback)
			}
			let result = yield r.db(db).table('races').get(race.id).run(conn)
			return Promise.resolve(result)
		})
		return Promise.resolve(task()).asCallback(callback)
	}

	getRaceByEthni(ethniId, callback){
		if(!this.connected){
			return Promise.reject(new Error('not connected')).asCallback(callback)
		}

		let connection = this.connection
		let db = this.db

		let task = co.wrap(function * (){
			let conn = yield connection
			yield r.db(db).table('races').indexWait().run(conn)
			let races = yield r.db(db).table('races').getAll(ethniId,{
				index: 'ethniId'
			}).run(conn)
			if(!races){
				return Promise.reject(new Error(`ethnicities ${ethniId}, not has Race or not exist`))
			}
			let result = yield races.toArray()
			return Promise.resolve(result)
		})
		return Promise.resolve(task()).asCallback(callback)
	}
	//Pet Section
	savePet(pet, callback){
		if(!this.connected){
			return Promise.reject(new Error('not connected')).asCallback(callback)
		}

		let connection = this.connection
		let db = this.db

		let task = co.wrap(function *(){
			let conn = yield connection

			pet.age = utils.calAge(pet.borndate)
			pet.borndate = new Date(pet.borndate)
			pet.createdAt = new Date()
			

			let result = yield r.db(db).table('pets').insert(pet).run(conn)

			if(result.error > 0){
				return Promise.reject(new Error(result.first_error))
			}
			pet.id = result.generated_keys[0]

			let created = yield r.db(db).table('pets').get(pet.id).run(conn)

			return Promise.resolve(created)
		})
		return Promise.resolve(task()).asCallback(callback)
	}

	getPetsByClient(owner, callback){
		if(!this.connected){
			return Promise.reject(new Error('not connected')).asCallback(callback)
		}

		let connection = this.connection
		let db = this.db

		let task = co.wrap(function * (){
			let conn = yield connection
			yield r.db(db).table('pets').indexWait().run(conn)
			let pets = yield r.db(db).table('pets').getAll(owner,{
				index: 'owner'
			}).run(conn)
			if(!pets){
				return Promise.reject(new Error(`owner ${owner}, not has pet or not exist`))
			}
			let result = yield pets.toArray()
			return Promise.resolve(result)
		})
		return Promise.resolve(task()).asCallback(callback)
	}
	//PetImage Section
	savePetImage(image, callback){
		if(!this.connected) {
			return Promise.reject(new Error('not connected')).asCallback(callback)
		}

		let connection = this.connection
		let db = this.db

		let task = co.wrap(function * () {
			let conn = yield connection
			image.createdAt = new Date()

			let result = yield r.db(db).table('petsimages').insert(image).run(conn)

			if(result.errors > 0){
				return Promise.reject(new Error(result.first_error))
			}

			image.id = result.generated_keys[0]
			let created = yield r.db(db).table('petsimages').get(image.id).run(conn)

			return Promise.resolve(created)
		})

		return Promise.resolve(task()).asCallback(callback)
	}

	//Need add ID of the pet to get all the images for this
	getPetImages(callback){
		if (!this.connected) {
      return Promise.reject(new Error('not connected')).asCallback(callback)
    }

    let connection = this.connection
    let db = this.db

    let tasks = co.wrap(function * () {
      let conn = yield connection

      yield r.db(db).table('petsimages').indexWait().run(conn)
      let images = yield r.db(db).table('petsimages').orderBy({
        index: r.desc('petid')
      }).run(conn)
      let result = yield images.toArray()

      return Promise.resolve(result)
    })

    return Promise.resolve(tasks()).asCallback(callback)
	}

	// Medicine Section
	saveMedicine(medicine, callback){
	  if(!this.connected){
	  	return Promise.reject(new Error('not connected')).asCallback(callback)
	  }

	  let connection = this.connection
	  let db = this.db

	  let task = co.wrap(function * () {
	  	let conn = yield connection
	  	medicine.createdAt = new Date()
	  	
	  	let result = yield r.db(db).table('medicine').insert(medicine).run(conn)

	  	if(result.errors > 0){
	  		return Promise.reject(new Error(result.first_error)).asCallback(callback)
	  	}

	  	medicine.id = result.generated_keys[0]

	  	let created = yield r.db(db).table('medicine').get(medicine.id).run(conn)

	  	return Promise.resolve(created) 
	  })
	  return Promise.resolve(task()).asCallback(callback)
	}

	updateMedicine(medicine, callback){
		if(!this.connected){
			return Promise.reject(new Error('not connected')).asCallback(callback)
		}

		let connection = this.connection
		let db = this.db

		let task = co.wrap(function * (){
			let conn = yield connection

			let updated = yield r.db(db).table('medicine').get(medicine.id).update(medicine).run(conn)

			if(updated.errors > 0){
				return Promise.reject(new Error(update.first_error)).asCallback(callback)
			}
			let result = yield r.db(db).table('medicine').get(medicine.id).run(conn)
			return Promise.resolve(result)
		})
		return Promise.resolve(task()).asCallback(callback)
	}

	getMedicineByLab(laboratoryId, callback){
		if(!this.connected){
			return Promise.reject(new Error('not connected')).asCallback(callback)
		}

		let connection = this.connection
		let db = this.db

		let task = co.wrap(function * (){
			let conn = yield connection
			yield r.db(db).table('medicine').indexWait().run(conn)
			let medicines = yield r.db(db).table('medicine').getAll(laboratoryId,{
				index: 'laboratoryId'
			}).run(conn)

			let result = yield medicines.toArray()
			return Promise.resolve(result)
		})
		return Promise.resolve(task()).asCallback()
	}
	//Appointment Section
	saveAppointment(appointment, callback){
	  if(!this.connected){
	  	return Promise.reject(new Error('not connected')).asCallback(callback)
	  }

	  let connection = this.connection
	  let db = this.db

	  let task = co.wrap(function * () {
	  	let conn = yield connection
	  	appointment.createdAt = new Date()
	  	
	  	let result = yield r.db(db).table('appointment').insert(appointment).run(conn)

	  	if(result.errors > 0){
	  		return Promise.reject(new Error(result.first_error))
	  	}
	  	
	  	appointment.id = result.generated_keys[0]

	  	let created = yield r.db(db).table('appointment').get(appointment.id).run(conn)

	  	return Promise.resolve(appointment)
	  })
	  return Promise.resolve(task()).asCallback(callback)
	}

	updateAppointment(appointment, callback){
		if(!this.connected){
			return Promise.reject(new Error('not connected')).asCallback(callback)
		}

		let connection = this.connection
		let db = this.db

		let task = co.wrap(function * () {
		  let conn = yield connection
		  let pet = yield r.db(db).table('pets').get(appointment.petid).run(conn)

		  let petResult = yield r.db(db).table('pets').get(pet.id).update({
	  		weight: appointment.petweight,
	  		age: appointment.petAge
	  	}).run(conn)

	  	if(petResult.errors > 0){
	  		return Promise.reject(new Error(petResult.first_error))
	  	}

		 let result = yield r.db(db).table('appointment').update(appointment).run(conn)

			if(result.errors > 0){
			  return Promise.reject(new Error(result.first_error)).asCallback(callback)
			}

		  let created = yield r.db(db).table('appointment').get(appointment.id).run(conn)

		  return Promise.resolve(created)
		})
		return	Promise.resolve(task()).asCallback(callback)
	}

	getAppointments(callback){
	  if(!this.connected){
			return Promise.reject(new Error('not connected')).asCallback(callback)
		}

		let connection = this. connection
		let db = this.db

		let task = co.wrap(function * (){
			let conn = yield connection
			let status = 'A'
			
			let result = yield r.db(db).table('appointment').getAll(status, {
				index: 'status'
			}).run(conn)

			if(!result){
				return Promise.reject(new Error(`No appointment founds`)).asCallback(callback)
			}

					if(result.errors){
				return Promise.reject(new Error(`yeap ${result.first_error}`)).asCallback(callback)
			}

			let apoint = result.toArray()

			return Promise.resolve(apoint)
		})
		return Promise.resolve(task()).asCallback(callback)
	}

	getAppointmentByPet(petid, callback) {
		if(!this.connected){
			return Promise.reject(new Error('not connected')).asCallback(callback)
		}

	  let connection = this. connection
		let db = this.db

		let task = co.wrap(function * (){
			let conn = yield connection
			
			let result = yield r.db(db).table('appointment').getAll(petid, {
				index: 'petid'
			}).run(conn)

			if(!result){
				return Promise.reject(new Error(`No appointment founds`)).asCallback(callback)
			}

					if(result.errors){
				return Promise.reject(new Error(`yeap ${result.first_error}`)).asCallback(callback)
			}

			let apoint = result.toArray()

			return Promise.resolve(apoint)
		})
		return Promise.resolve(task()).asCallback(callback)
	}
	//ApRecord Section
	saveApRecord(record, callback){
		if(!this.connected){
			return Promise.reject(new	Error('not connected')).asCallback(callback)
		}

		let connection = this.connection
		let db = this.db

		let task = co.wrap(function * (){
			let conn = yield connection
			record.createdAt = new Date()

			let result = yield r.db(db).table('aprecord').insert(record).run(conn)

			if(result.errors > 0){
			  return Promise.reject(new Error(result.first_error)).asCallback(callback)
			}

			record.id = result.generated_keys[0]

			let created = yield r.db(db).table('aprecord').get(record.id).run(conn)

			return Promise.resolve(created)
		})

		return Promise.resolve(task()).asCallback(callback)
	}	

	updateApRecord(record, callback){
		if(!this.connected){
			return Promise.reject(new	Error('not connected')).asCallback(callback)
		}

		let connection = this.connection
		let db = this.db

		let task = co.wrap(function * (){
			let conn = yield connection
			record.createdAt = new Date()

			let result = yield r.db(db).table('aprecord').update(record).run(conn)

			if(result.errors > 0){
			  return Promise.reject(new Error(result.first_error)).asCallback(callback)
			}

			let created = yield r.db(db).table('aprecord').get(record.id).run(conn)

			return Promise.resolve(created)
		})

		return Promise.resolve(task()).asCallback(callback)
	}	
	
	getApRecord(apId, callback){
	  if(!this.connected){
			return Promise.reject(new Error('not connected')).asCallback(callback)
		}

		let connection = this.connection
		let db = this.db

		let task = co.wrap(function * (){
			let conn = yield connection

			yield r.db(db).table('aprecord').indexWait().run(conn)
			let apRecord = yield r.db(db).table('aprecord').getAll(apId,{
				index: 'apId'
			}).run(conn)

			if(!apRecord){
				return Promise.reject(new Error(`appointment # ${apId}, not has found or not exist`))
			}

			let result = yield apRecord.toArray()
			return Promise.resolve(result)
		})
		return Promise.resolve(task()).asCallback(callback)
	}
	
}

module.exports = Db