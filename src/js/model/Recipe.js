import axios from 'axios';
import {
  proxy,
  key
} from "../config";

export default class Recipe {
  constructor(id) {
    this.id = id;
  };

  async getRecipe() {
    try {
      const res = await axios(`${proxy}http://food2fork.com/api/get?key=${key}&rId=${this.id}`);
      this.title = res.data.recipe.title;
      this.author = res.data.recipe.publisher;
      this.img = res.data.recipe.image_url;
      this.url = res.data.recipe.source_url;
      this.ingredients = res.data.recipe.ingredients;
    } catch (error) {
      console.log(error);
    }
  };

  calcTime() {
    // Assuming that we need 15 min for each 3 ingredients
    // функция подсчета времени приготовления блюда - 15 минут на каждый ингредиент

    const numIng = this.ingredients.length;
    const periods = Math.ceil(numIng / 3);
    this.time = periods * 15;
  };

  calcServings () {
    this.servings = 4;
  };

  parseIngredients () {
    const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
    const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
    const units = [...unitsShort, 'kg', 'g']

    const newIngredients = this.ingredients.map(el => {
      // 1) Uniform units - компануем ингридиенты
      let ingredient = el.toLowerCase();
      unitsLong.forEach((unit, i) => {
        ingredient = ingredient.replace(unit, unitsShort[i])
      });

      // 2) Remove parentheses - удаляем скобки
      ingredient = ingredient.replace(/ *\([^)]*\) */g, ' '); // replace parentheses using RegExp - удаляем скобки с помощью RegExp

      // 3) parse ingredients into count, unit and ingredients - сортируем ингредиенты
      const arrIng = ingredient.split(' ');
      const unitIndex = arrIng.findIndex(el2 => units.includes(el2)); // includes checks if the element el2 is in the array unitsShort
                                                                          // findIndex returns index of the element if true, -1 if false
      let objIng;
      if (unitIndex > -1) {
        const arrCount = arrIng.slice(0, unitIndex);
        let count;

        if (arrCount.length === 1) {
          count = eval(arrIng[0].replace('-', '+'));
        } else {
          count = eval(arrIng.slice(0, unitIndex).join('+'));
        }

        objIng = {
          count,
          unit: arrIng[unitIndex],
          ingredient: arrIng.slice(unitIndex+1).join(' ')
        }

      } else if (parseInt(arrIng[0], 10)) {
        // no unit, but the 1st el is a number
        objIng = {
          count: parseInt(arrIng[0], 10),
          unit: '',
          ingredient: arrIng.slice(1).join(' ')
        }
      }
       else if (unitIndex === -1) {
         objIng = {
           count: 1,
           unit: '',
           ingredient // ingredient: ingredient
         }
      }

      return objIng;

    });
    this.ingredients = newIngredients;
  };

updateServings (type) {
  // servings
  const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;


  // ingredients
  this.ingredients.forEach( ing => {
    ing.count *= (newServings / this.servings);
  })

  this.servings = newServings;
}

};
