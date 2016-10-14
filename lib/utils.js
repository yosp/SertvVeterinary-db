'use strict'

const crypto = require('crypto')

const utils = {
  calAge,
  encrypt
}

function calAge(petBorndate){
  let borndate = new Date(petBorndate)
  let today = new Date()

  let petYears = today.getFullYear() - borndate.getFullYear()

  if(today.getMonth() < borndate.getMonth()){
	  let months = 12 - (borndate.getMonth() - today.getMonth())
	  if(months > 9){
		  months = months/100
	  }else{
		  months = months/10
	  }
	  petYears = petYears+ months
	}else{
		let months = today.getMonth() - borndate.getMonth()
		if(months > 9){
		  months = months/100
	  }else{
		  months = months/10
	  }
	  petYears = petYears+ months
	}

  return petYears
}

function encrypt (password) {
  let shasum = crypto.createHash('sha256')
  shasum.update(password)
  return shasum.digest('hex')
}

module.exports = utils