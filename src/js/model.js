import { API_URL, API_KEY } from './config';
import { RESULTS_PER_PAGE } from './config';
import { makeRequest } from './helper';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RESULTS_PER_PAGE,
  },
  bookmarks: [],
};

const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
};

export const loadRecipe = async function (recipeId) {
  try {
    const data = await makeRequest(`${API_URL}/${recipeId}?key=${API_KEY}`);

    state.recipe = createRecipeObject(data);

    if (state.bookmarks.some(bookmark => bookmark.id === recipeId)) {
      state.recipe.bookmarked = true;
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const results = await makeRequest(
      `${API_URL}?search=${query}&key=${API_KEY}`
    );

    state.search.results = results.data.recipes.map(recipe => {
      return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        image: recipe.image_url,
        ...(recipe.key && { key: recipe.key }),
      };
    });

    state.search.page = 1;
  } catch (error) {
    console.log(error);
    throw err;
  }
};

export const getSearchResultsPage = function (pageNumber = state.search.page) {
  state.search.page = pageNumber;

  const start = (pageNumber - 1) * RESULTS_PER_PAGE;
  const end = pageNumber * RESULTS_PER_PAGE;

  return state.search.results.slice(start, end);
};

export const updateServings = function (newQuantity) {
  state.recipe.ingredients.forEach(ingredient => {
    ingredient.quantity = +(
      (ingredient.quantity * newQuantity) /
      state.recipe.servings
    ).toFixed(2);
  });

  state.recipe.servings = newQuantity;
};

const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = function (recipe) {
  state.bookmarks.push(recipe);

  if (recipe.id === state.recipe.id) {
    state.recipe.bookmarked = true;
  }

  persistBookmarks();
};

export const removeBookmark = function (recipeId) {
  const index = state.bookmarks.findIndex(bookmark => bookmark.id === recipeId);
  state.bookmarks.splice(index, 1);

  if (recipeId === state.recipe.id) {
    state.recipe.bookmarked = false;
  }
  persistBookmarks();
};

export const uploadRecipe = async function (newRecipe) {
  const ingredients = _extractIngredientsFromForm(newRecipe);

  const recipe = {
    title: newRecipe.title,
    source_url: newRecipe.sourceUrl,
    image_url: newRecipe.image,
    publisher: newRecipe.publisher,
    cooking_time: +newRecipe.cookingTime,
    servings: newRecipe.servings,
    ingredients,
  };

  const response = await makeRequest(`${API_URL}?key=${API_KEY}`, recipe);
  state.recipe = createRecipeObject(response);
  addBookmark(state.recipe);
};

const _extractIngredientsFromForm = function (newRecipe) {
  return Object.entries(newRecipe)
    .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
    .map(ingredient => {
      const ingredients = ingredient[1].split(',').map(ing => ing.trim());

      if (ingredients.length !== 3) {
        throw new Error(
          'Wrong ingredients format! Please use the correct format :)'
        );
      }

      const [quantity, unit, description] = ingredients;
      return { quantity: quantity ? +quantity : null, unit, description };
    });
};

const init = function () {
  const bookmarksStored = localStorage.getItem('bookmarks');

  if (bookmarksStored) {
    state.bookmarks = JSON.parse(bookmarksStored);
  }
};

init();
