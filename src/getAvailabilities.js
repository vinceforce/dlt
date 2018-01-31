import moment from 'moment'
import knex from 'knexClient'

export default async function getAvailabilities(date) {

	var availabilities = new Array(7);
	var sevenDaysSlots = sevenDaysSlotNames(date);
	var availableSlots = new Array(7*48)
	for (i in availableSlots) availableSlots[i] = false
	tsDate = Date.parse(date);
	tsEnd = tsDate + 7*24*60*60*1000

  	await openingsFunc(tsDate, tsEnd)
  	.then(function(openings){
  		for (opening in openings) {
  			o = openings[opening];
  			openingSlots = getSlotIndexes(date, o.starts_at, o.ends_at);
  			if (openingSlots) for (i=0; i<openingSlots.length; i++) availableSlots[openingSlots[i]] = true
  		}
  	})

  	await openingsWeeklyFunc(tsDate, tsEnd)
  	.then(function(openings){
  		for (opening in openings) {
  			o = openings[opening];
  			tzOffset = date.getTimezoneOffset() * 60 * 1000
  			weeksToAdd = Math.floor((tsDate + tzOffset - o.starts_at) / (86400000*7))
  			daysToAdd = 7 * weeksToAdd + 7 
  			startInWeek = o.starts_at + daysToAdd * 86400000
  			endInWeek = o.ends_at + daysToAdd * 86400000
  			openingSlots = getSlotIndexes(date, startInWeek, endInWeek);
  			if (openingSlots) for (i=0; i<openingSlots.length; i++) availableSlots[openingSlots[i]] = true
  		}
  	})

  	await appointmentsFunc(tsDate, tsEnd)
  	.then(function(openings){
  		for (opening in openings) {
  			o = openings[opening];
  			openingSlots = getSlotIndexes(date, o.starts_at, o.ends_at);
  			if (openingSlots) for (i=0; i<openingSlots.length; i++) availableSlots[openingSlots[i]] = false
  		}
  	})
  	.then(function(){
  		for (i=0; i < 7; i++) {
			availabilities[i] = {date : String(new Date(addDays(date, i))),
				slots: slotNames(availableSlots, i)}
			// console.log('availabilities[i].date : ' + availabilities[i].date)
			// console.log('availabilities[i].slots : ' + availabilities[i].slots)
		}
  	})

  	return availabilities

}

var openingsFunc = function(start, end) {
	return new Promise(function(resolve, reject){
		knex.select('starts_at','ends_at', 'weekly_recurring')
		.from('events')
		.where('kind', 'opening')
		.andWhere('weekly_recurring', null)
		.andWhere('starts_at', '<=', end)
		.andWhere('starts_at', '>=', start)

		.then(openings => {resolve(openings)})
	})
}

var openingsWeeklyFunc = function(start, end) {
	return new Promise(function(resolve, reject){
		knex.select('starts_at','ends_at', 'weekly_recurring')
		.from('events')
		.where('kind', 'opening')
		.andWhere('weekly_recurring', 1)
		.andWhere('starts_at', '<=', start)
		.then(openings => {resolve(openings)})
	})
}

var appointmentsFunc = function(start, end) {
	return new Promise(function(resolve, reject){
		knex.select('starts_at','ends_at')
		.from('events')
		.where('kind', 'appointment')
		.andWhere('starts_at', '<=', end)
		.andWhere('starts_at', '>=', start)

		.then(openings => {resolve(openings)})
	})
}

function getSlotIndexes(date, starts_at, ends_at) {
	tzOffset = date.getTimezoneOffset() * 60 * 1000
	// console.log('getSlotIndexes')
	tsDate = Date.parse(date)
	sltFloor = 48 * Math.floor((starts_at - tsDate) / 86400000) + Math.floor((starts_at - tzOffset) / 1800000 % 24)
	diff = Math.floor((ends_at - starts_at) / 1800000 % 24)
	return(diff > 0?range(sltFloor, sltFloor + diff - 1):null)
}

function addDays(strDate, intNum) {
	dDate =  new Date(strDate);
	dDate.setDate(dDate.getDate() + intNum);
	dY = dDate.getFullYear()
	dM = dDate.getMonth() + 1
	dD = dDate.getDate()

	return(dY + "-" + dM + "-" + dD);
}

function dateDiff(strDate1, strDate2) {
    var diff = Date.parse(strDate2) - Date.parse(strDate1); 
    return isNaN(diff) ? NaN : {
        diff : diff,
        ms : Math.floor( diff            % 1000 ),
        s  : Math.floor( diff /     1000 %   60 ),
        m  : Math.floor( diff /    60000 %   60 ),
        h  : Math.floor( diff /  3600000 %   24 ),
        d  : Math.floor( diff / 86400000        )
    };
}

function slotNames(availableSlots, i) {
	sN = new Array()
	for (j=0; j<47; j++) {
		if (availableSlots[i*48 + j]) sN.push(getSlotName(j));
	}
	return(sN) 
}

function getSlotName(slotindex) {
	h = Math.floor(slotindex / 2);
	m = (h == slotindex / 2) ? "00" : "30";
	return(h + ":" + m);
}

let range = (start, end) => [...Array(end - start + 1)].map((_, i) => start + i);



function sevenDaysSlotNames(date) {
	slots = new Array(7*48);
	dY = date.getFullYear()
	dM = date.getMonth() + 1
	dD = date.getDate()
	sDate = dY + "-" + dM + "-" + dD + " 00:00"
	for (i=0; i<7; i++) {
		for (j=0; j<48; j++) {
			slots.push(addDays(sDate, i) + " " + getSlotName(j))
		}
	}
	return(slots);
}