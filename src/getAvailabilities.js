import moment from 'moment'
import knex from 'knexClient'

// export default async function getAvailabilities(date) {

// }


export default async function getAvailabilities(date) {
  	// First get records corresponding to openings 
  	var openings = knex('events')
		.where(kind: 'opening')
		.whereBetween(starts_at, [date + ' 00:00:00', addDays(date, 7) + " 23:59:59"])
		.orWhere(weekly_recurring: true)
		.whereBetween(addDays(start_date, 7), [date + ' 00:00:00', addDays(date, 7) + " 23:59:59"])
		.select('starts_at', 'ends_at')
	// Then get records corresponding to appointments 
	var appointments = knex('events')
		.where(kind: 'appointment')
		.whereBetween(starts_at, [date + ' 00:00:00', addDays(date, 7) + " 23:59:59"])
		.orWhere(weekly_recurring: true)
		.whereBetween(addDays(starts_at, 7), [date + ' 00:00:00', addDays(date, 7) + " 23:59:59"])
		.select('starts_at', 'ends_at')
	// 48 slots of 30mns per day, 7 days
	var availableSlots = new Array(7*48)
	for (g in availableSlots) g = false;
	for (o in openings) {
		openingSlots = getSlotIndexes(o.date, o.starts_at, o.ends_at);
		if (openingSlots) for (i=0; i<openingSlots.length; i++) {availableSlots[openingSlots[i]] = true}
	}
	for (o in appointments) {
		appointmentsSlots = getSlotIndexes(o.date, o.starts_at, o.ends_at);
		if (appointmentsSlots) for (i=0; i<appointmentsSlots.length; i++) {availableSlots[appointmentsSlots[i]] = false}
	}
	var availabilities = new Array(7);
	for (i=0; i < 7; i++) {
		availabilities[i] = {date : addDays(date, i), slots: slotNames(availableSlots, i)}
	}
	return(availabilities)
}

function addDays(strDate, intNum) {
	dDate =  new Date(strDate);
	dDate.setDate(dDate.getDate() + intNum);
	return(dDate.getFullYear() + "-" + dDate.getMonth() + 1 + "-" + dDate.getDate());
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
	for (j=0; j<47) {
		if (availableSlots[i + j]) sN.append(getSlotName(j))
	}
	return(sN) 
}

function getSlotName(slotindex) {
	h = Math.floor(slotindex / 2);
	m = (h == slotindex / 2) ? "00" : "30";
	return(h + ":" + m);
}

let range = (start, end) => [...Array(end - start + 1)].map((_, i) => start + i);

function getSlotIndexes(date, starts_at, ends_at) {
	sS = dateDiff(date, starts_at).d;
	dD = dateDiff(starts_at, ends_at).d;
	eS = sS + dD;
	return(dD.diff > 0?range(sS, eS):null)
}


