'use strict'

const crypto = require('crypto')

const utils = {
  calAge
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

module.exports = utils