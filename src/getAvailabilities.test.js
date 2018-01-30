import knex from 'knexClient'
import getAvailabilities from './getAvailabilities'


describe('getAvailabilities', () => {
  beforeEach(() => knex('events').truncate())

  describe('simple case', () => {
    beforeEach(async () => {
      await knex('events').insert([
        {
          kind: 'opening',
          starts_at: new Date('2014-08-04 09:30'),
          ends_at: new Date('2014-08-04 12:30'),
          weekly_recurring: true,
        },
        {
          kind: 'appointment',
          starts_at: new Date('2014-08-11 10:30'),
          ends_at: new Date('2014-08-11 11:30'),
        },
        {
          kind: 'opening',
          starts_at: new Date('2014-08-10 09:30'),
          ends_at: new Date('2014-08-10 12:30'),
        },
        {
          kind: 'appointment',
          starts_at: new Date('2014-08-10 9:30'),
          ends_at: new Date('2014-08-11 12:30'),
        },
        {
          kind: 'opening',
          starts_at: new Date('2014-08-12 09:30'),
          ends_at: new Date('2014-08-12 12:30'),
        },
        {
          kind: 'opening',
          starts_at: new Date('2014-08-13 09:30'),
          ends_at: new Date('2014-08-13 12:30'),
        },
        {
          kind: 'opening',
          starts_at: new Date('2014-08-14 09:30'),
          ends_at: new Date('2014-08-14 12:30'),
        },
        {
          kind: 'opening',
          starts_at: new Date('2014-08-15 09:30'),
          ends_at: new Date('2014-08-15 12:30'),
        },
        {
          kind: 'opening',
          starts_at: new Date('2014-08-16 09:30'),
          ends_at: new Date('2014-08-16 12:30'),
        }
      ])
    })
    debugger;
    console.log("coucou")
    it('should fetch availabilities correctly', async () => {
      const availabilities = await getAvailabilities(new Date('2014-08-10'))
      expect(availabilities.length).toBe(7)

      expect(String(availabilities[0].date)).toBe(
        String(new Date('2014-08-10')),
      )
      expect(availabilities[0].slots).toEqual([])

      expect(String(availabilities[1].date)).toBe(
        String(new Date('2014-08-11')),
      )
      expect(availabilities[1].slots).toEqual([
        '9:30',
        '10:00',
        '11:30',
        '12:00',
      ])

      expect(String(availabilities[6].date)).toBe(
        String(new Date('2014-08-16')),
      )
    })
  })
})
