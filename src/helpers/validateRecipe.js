const validator = require('is-my-json-valid')

// EXAMPLE RECIPE:
// {
//   'id': 12662,
//   'name': 'Claw of Retribution',
//
//   'output_item_id': 86968,
//   'output_item_count': 1,
//   'ingredients': [
//     {'item_id': 87093, 'count': 1},
//     {'item_id': 87031, 'count': 60},
//     {'item_id': 24351, 'count': 5},
//     {'item_id': 76826, 'count': 1},
//     {'item_id': 71331, 'count': 1}
//   ],
//
//   'min_rating': 450,
//   'disciplines': ['Weaponsmith']
// }

const SCHEMA = {
  type: 'object',
  properties: {
    id: {
      type: 'integer',
      minimum: 1
    },
    name: {
      type: 'string',
      required: true
    },

    output_item_id: {
      type: 'integer',
      required: true,
      minimum: 1
    },
    output_item_count: {
      type: 'number',
      required: true,
      minimum: 0
    },
    ingredients: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          item_id: {
            type: 'integer',
            required: true,
            minimum: 1
          },
          count: {
            type: 'integer',
            required: true
          }
        }
      },
      minItems: 1,
      required: true
    },

    min_rating: {
      type: 'integer'
    },
    disciplines: {
      type: 'array',
      items: {
        type: 'string'
      },
      minItems: 1,
      required: true
    }
  },
  required: true,
  additionalProperties: false
}

const validate = validator(SCHEMA)

const RECIPE_KEYS = [
  {name: 'id', optional: true},
  {name: 'name'},
  {name: 'output_item_id'},
  {name: 'output_item_count'},
  {name: 'ingredients'},

  {name: 'min_rating', optional: true},
  {name: 'disciplines'}
]

const ALLOWED_KEYS = RECIPE_KEYS.map(x => x.name)
const REQUIRED_KEYS = RECIPE_KEYS.filter(x => !x.optional).map(x => x.name)

function validateRecipe (recipe, line) {
  let error = false
  const recipeKeys = Object.keys(recipe)

  // Check if all keys are allowed
  const notAllowedKeys = recipeKeys.filter(x => !ALLOWED_KEYS.includes(x))
  if (notAllowedKeys.length > 0) {
    console.log(`Recipe L${line}: Not allowed keys`)
    console.log(`\t` + notAllowedKeys.join(', '))
    console.log()
    error = true
  }

  // Check if all required keys are in there
  const missingRequired = REQUIRED_KEYS.filter(x => !recipeKeys.includes(x))
  if (missingRequired.length > 0) {
    console.log(`Recipe L${line}: Missing required keys`)
    console.log(`\t` + missingRequired.join(', '))
    console.log()
    error = true
  }

  // Check if the keys are in the right order
  const rightOrder = JSON.stringify(ALLOWED_KEYS.filter(x => recipeKeys.includes(x)))
  const currentOrder = JSON.stringify(recipeKeys)
  if (currentOrder !== rightOrder) {
    console.log(`Recipe L${line}: Wrong key order`)
    console.log(`\tExpected: ${rightOrder}`)
    console.log(`\tActual: ${currentOrder}`)
    console.log()
    error = true
  }

  // Check if the schema matches
  const valid = validate(recipe, {verbose: true, greedy: true})
  if (!valid) {
    console.log(`Recipe L${line}: Schema validation failed`)
    console.log(validate.errors.map(x => `\t${x.field} ${x.message}`).join('\n'))
    console.log()
    error = true
  }

  return error
}

module.exports = validateRecipe