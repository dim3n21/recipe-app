// Global app controller

import Search from './model/Search';
import * as searchView from './views/searchView';
import { elements, renderLoader, clearLoader } from './views/base';

/** Global state of the app
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Likes recipes
 */


const state = {};

const controlSearch = async () => {

  // 1) Get query from view - берем запрос из поиска
  const query = searchView.getInput();

  if(query) {
    // 2) New search object and add to state - создаем новый объкт и добавляем в стэйт
    state.search = new Search(query);

    // 3) Prepare UI for result - подготавливает UI для результата
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);

    // 4) Search recipes - искать результат => state.search.result
    await state.search.getResult();

    // 5) Render result on UI - выводим результат на страницу
    clearLoader();
    searchView.renderResults(state.search.result);
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
