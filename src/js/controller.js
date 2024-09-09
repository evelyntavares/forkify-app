import * as model from './model.js';
import { MODAL_TIME_TO_CLOSE } from './config';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import newRecipeView from './views/newRecipeView.js';

const controlRecipes = async function () {
  try {
    const recipeId = window.location.hash.slice(1);

    if (!recipeId) return;

    recipeView.renderSpinner();

    resultsView.update(model.getSearchResultsPage());

    bookmarksView.update(model.state.bookmarks);

    await model.loadRecipe(recipeId);

    recipeView.render(model.state.recipe);
  } catch (error) {
    console.log(error);
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    const query = searchView.getQuery();
    if (!query) return;

    await model.loadSearchResults(query);
    resultsView.render(model.getSearchResultsPage());
    paginationView.render(model.state.search);
  } catch (error) {
    throw error;
  }
};

const controlPagination = function (pageToGoTo) {
  resultsView.render(model.getSearchResultsPage(pageToGoTo));
  paginationView.render(model.state.search);
};

const controlServings = function (newQuantity) {
  model.updateServings(newQuantity);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  if (model.state.recipe.bookmarked) {
    model.removeBookmark(model.state.recipe.id);
  } else {
    model.addBookmark(model.state.recipe);
  }

  recipeView.update(model.state.recipe);

  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlNewRecipe = async function (newRecipe) {
  try {
    newRecipeView.renderSpinner();

    await model.uploadRecipe(newRecipe);
    recipeView.render(model.state.recipe);

    newRecipeView.renderMessage();

    bookmarksView.render(model.state.bookmarks);

    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    setTimeout(function () {
      newRecipeView.toggleWindow(), MODAL_TIME_TO_CLOSE * 1000;
    });
  } catch (error) {
    console.log(error);
    newRecipeView.renderError(error.message);
  }
};

const controlDeleteRecipe = async function () {
  const response = await model.deleteRecipe(model.state.recipe.id);

  if (response.status === 204) {
    await model.loadSearchResults(model.state.search.query);
    resultsView.render(model.getSearchResultsPage());
    paginationView.render(model.state.search);

    bookmarksView.update(model.state.bookmarks);
    window.history.back();
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  recipeView.addHandlerDeleteRecipe(controlDeleteRecipe);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  newRecipeView.addHandlerUpload(controlNewRecipe);
};

init();
