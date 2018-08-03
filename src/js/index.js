// Global app controller

import Search from './model/Search';
import Recipe from './model/Recipe';
import List from './model/List';
import Likes from './model/Likes';

import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';

import {
  elements,
  renderLoader,
  clearLoader
} from './views/base';

/** Global state of the app
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Likes recipes
 */


/**
 *** SEARCH model
 **/

const state = {};

const controlSearch = async () => {

  // 1) Get query from view - берем запрос из поиска
  const query = searchView.getInput();

  if (query) {
    // 2) New search object and add to state - создаем новый объкт и добавляем в стэйт
    state.search = new Search(query);

    // 3) Prepare UI for result - подготавливает UI для результата
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);

    try {
      // 4) Search recipes - искать результат => state.search.result
      await state.search.getResult();

      // 5) Render result on UI - выводим результат на страницу
      clearLoader();
      searchView.renderResults(state.search.result);
    } catch(error) {
      alert(`something is wrong with the search -- ${error}`);
      clearLoader();
    }
  }
}

elements.searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  controlSearch();
})

elements.searchResPages.addEventListener('click', e => {
  const btn = e.target.closest('.btn-inline');
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.result, goToPage);
  }
})



/**
 *** RECIPE model
 **/

const controlRecipe = async () => {

  const id = window.location.hash.replace('#', '');

  if (id) {

    // prepare UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    // Highlight selected search recipe - подсветка выбранного элемента
    if (state.search) searchView.highlightSelected(id);

    // create new recipe object
    state.recipe = new Recipe(id);

    try {
      // get recipe data and parse ingredients
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();

      // calculate servings and time
      state.recipe.calcTime();
      state.recipe.calcServings();

      // render recipe
      clearLoader();
      recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));

    } catch (error) {
      alert(`something is wrong with Recipe -- ${error}`)
    }

  };
};


['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));


/**
 *** LIST model
 **/

 const controlList = () => {
   //create new list if it's not created - создаем объект, если его нет
   if (!state.list) state.list = new List();

   // add each element to the list and to the shopping card - добавляем едементы в объект и на шоп карут
   state.recipe.ingredients.forEach(el => {
     const item = state.list.addItem(el.count, el.unit, el.ingredient);
     listView.renderItem(item);
   });
 }

 // Handle delete and update list item events - удаляем элементы из шоппинк карты и обновляешь лист объект
elements.shopping.addEventListener('click', e => {
  const id = e.target.closest('.shopping__item').dataset.itemid;

  // Handle the delete button - пишем кнопку удалить
  if (e.target.matches('.shopping__delete, .shopping__delete *')) {
    state.list.deleteItem(id);
    listView.deleteItem(id);

    // handle the count update
  } else if (e.target.matches('.shopping__count-value')) {
    const val = parseFloat(e.target.value, 10);
    state.list.updateCount(id, val);
  }
});

/**
 *** LIKE model
 **/


 const controleLike = () => {
   if (!state.likes) state.likes = new Likes();

   // User has NOT yet liked current recipe - еще не нажат "Лайк"
   const currentID = state.recipe.id;

   if (!state.likes.isLiked(currentID)) {
     // Add like to the state - добавляем объект в стейт
     const newLike = state.likes.addLike(
       currentID,
       state.recipe.title,
       state.recipe.author,
       state.recipe.img
     );

     // Toggle the like button - переводим икончу "лайк" в режим активности
     likesView.toggleLikeBtn(true);

     // Add like to the UI list - добавляем рецепт в список понравившихся
     likesView.renderLike(newLike);

    // User HAS likes current recipe - нажат "Лайк"
   } else {
     // Remove like from the state
     state.likes.deleteLike(currentID);

     // Toggle the like button - переводим икончу "лайк" в режим активности
     likesView.toggleLikeBtn(false);

     // Remove like to the UI list - удаляем рецепт в список понравившихся
     likesView.deleteLike(currentID);
   }

   likesView.toggleLikeMenu(state.likes.getNumLikes());

 }

 // Restore liked recipes on page load - возобновляем созраненный массив

 window.addEventListener('load', () => {

   state.likes = new Likes()

   // Restore likes - возбновляем массив лайков
   state.likes.readStorage();

   // Toggle like menu button - добавляем/убираем иконку лайк
   likesView.toggleLikeMenu(state.likes.getNumLikes());

   // Render the existing likes - отображае понравившийся рецепт в поле like
   state.likes.likes.forEach(like => likesView.renderLike(like));

 })


// Handling recipe button clicks - управления для кнопок на рецептах

elements.recipe.addEventListener('click', e => {
  if (e.target.matches('.btn-decrease, .btn-decrease *')) {
    // decrese btn is clicked
    if (state.recipe.servings > 1) {
      state.recipe.updateServings('dec');
      recipeView.updateServingsIngredients(state.recipe);
    }

  } else if (e.target.matches('.btn-increase, .btn-increase *')) {
    state.recipe.updateServings('inc');
    recipeView.updateServingsIngredients(state.recipe);
  } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
    controlList();
  } else if (e.target.matches('.rrecipe__love, .recipe__love *')){
    controleLike();
  }
})
