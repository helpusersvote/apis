const { Router } = require('express')
const { getStates } = require('@helpusersvote/election-logic')

const app = Router()

app.get('/state-deadlines', (req, res) => {
  const { query } = req
  const { state, states: statesQuery } = query

  return res.json({
    states: getStates(state || statesQuery).map(state => {
      return {
        name: state.name,
        abbr: state.abbr,
        deadline: state.reg_deadline
      }
    })
  })
})

module.exports = app
