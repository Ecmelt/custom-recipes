import React, {Component} from 'react'
import {observable} from 'mobx'
import {observer} from 'mobx-react'
import c from 'classnames'

@observer
class App extends Component {
  @observable apiResponse = null
  @observable itemNames = {}
  @observable index = 0

  componentDidMount () {
    this.fetchItemNames()
    this.fetchFromAPI()
  }

  async fetchItemNames () {
    try {
      this.itemNames = JSON.parse(localStorage.getItem('itemNames'))
      return
    } catch (_) {
    }

    const response = await window.fetch('http://api.gw2efficiency.com/items?ids=all')
    const items = await response.json()

    let map = {}
    items.forEach(item => {
      map[item.id] = item.name
    })

    this.itemNames = map
    localStorage.setItem('itemNames', JSON.stringify(map))
  }

  async fetchFromAPI () {
    const response = await window.fetch(`http://localhost:3001/api/${this.index}`)
    this.apiResponse = await response.json()
  }

  async previous () {
    this.index--
    this.fetchFromAPI()
  }

  async next () {
    this.index++
    this.fetchFromAPI()
  }

  async dismiss () {
    const body = {action: 'dismiss'}

    await window.fetch(`http://localhost:3001/api/${this.index}`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.fetchFromAPI()
  }

  async add () {
    const body = {action: 'add'}

    await window.fetch(`http://localhost:3001/api/${this.index}`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.fetchFromAPI()
  }

  async overwrite (existingIndex) {
    const body = {action: 'overwrite', existingIndex}

    await window.fetch(`http://localhost:3001/api/${this.index}`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.fetchFromAPI()
  }

  render () {
    if (!this.apiResponse) {
      return null
    }

    return (
      <div>
        {/* Top navigation bar */}
        <div className="p-2 bg-light">
          <div className="container d-flex align-items-center">
            <button
              className='btn btn-primary mr-2'
              onClick={() => this.previous()}
              disabled={this.index === 0}
            >
              Previous
            </button>

            <button
              className='btn btn-primary'
              onClick={() => this.next()}
              disabled={this.index === this.apiResponse.total - 1}
            >
              Next
            </button>

            <div className='ml-auto'>
              Reviewing <strong>{this.index + 1}</strong> of <strong>{this.apiResponse.total}</strong> differences
            </div>
          </div>
        </div>

        <div className="container mt-4 d-flex">
          {/* New Recipe */}
          <div className="w-50 mr-4">
            <h3>New</h3>

            <RecipeCard
              recipe={this.apiResponse.updater}
              itemNames={this.itemNames}
              mode='new'
              dismiss={() => this.dismiss()}
              add={() => this.add()}
            />
          </div>

          {/* Existing recipes */}
          <div className="w-50">
            <h3>Existing</h3>

            {this.apiResponse.existing.map(existing =>
              <RecipeCard
                key={existing.index}
                recipe={existing}
                diffRecipe={this.apiResponse.updater}
                itemNames={this.itemNames}
                mode='existing'
                overwrite={(x) => this.overwrite(x)}
              />
            )}
          </div>
        </div>
      </div>
    )
  }
}

class RecipeCard extends Component {
  render () {
    const recipe = this.props.recipe
    const diffRecipe = this.props.diffRecipe
    const itemNames = this.props.itemNames
    const mode = this.props.mode

    return (
      <div className='card mb-3'>
        <div className="card-body">
          {/* Output Count & Name */}
          <div className='d-flex mb-2'>
            <strong className='mr-2'>{recipe.output_item_count}</strong>
            <span className='mr-1'>{itemNames[recipe.output_item_id]}</span>
            <span className='text-muted'>({recipe.output_item_id})</span>
            {recipe.id && <span className='ml-auto'>({recipe.id})</span>}
          </div>

          {/* Ingredients */}
          {recipe.ingredients.map((ingredient, index) => {
            let countIsDifferent = false
            let itemIsDifferent = false

            if (diffRecipe) {
              countIsDifferent = !diffRecipe.ingredients[index] ||
                diffRecipe.ingredients[index].count !== ingredient.count
              itemIsDifferent = !diffRecipe.ingredients[index] ||
                diffRecipe.ingredients[index].item_id !== ingredient.item_id
            }

            return (
              <div key={index} className='d-flex'>
                <strong
                  className={c([
                    'mr-2',
                    {'text-danger': countIsDifferent}
                  ])}
                >
                  {ingredient.count}
                </strong>
                {' '}
                <span
                  className={c([
                    'mr-1',
                    {'text-danger': itemIsDifferent}
                  ])}
                >
                  {itemNames[ingredient.item_id]}
                </span>
                {' '}
                <span className='text-muted'>({ingredient.item_id})</span>
              </div>
            )
          })}

          {/* Disciplines & Rating */}
          <div className="mt-2">
            {recipe.disciplines.join(', ')}
            {' '}
            {recipe.min_rating && <span>(Min {recipe.min_rating})</span>}
          </div>
        </div>

        {/* Buttons */}
        <div className="card-footer d-flex">
          {mode === 'new' && (
            <button
              className='btn btn-success btn-sm mr-2'
              onClick={() => this.props.add()}
            >
              Accept new
            </button>
          )}

          {mode === 'new' && (
            <a
              href={`https://wiki.guildwars2.com/index.php?title=Special%3ASearch&search=${window.encodeURIComponent(recipe.name)}`}
              target='_blank'
              className='btn btn-sm mr-2'
            >
              Open on Wiki
            </a>
          )}

          {mode === 'new' && (
            <button
              className='btn btn-danger btn-sm ml-auto'
              onClick={() => this.props.dismiss()}
            >
              Ignore
            </button>
          )}

          {mode === 'existing' && (
            <button
              className='btn btn-warning btn-sm'
              onClick={() => this.props.overwrite(recipe.index)}
            >
              Overwrite
            </button>
          )}
        </div>
      </div>
    )
  }
}

export default App