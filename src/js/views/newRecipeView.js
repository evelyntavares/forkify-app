import icons from 'url:../../img/icons.svg';
import View from './view';

class NewRecipeView extends View {
  _parentElement = document.querySelector('.upload');
  _window = document.querySelector('.add-recipe-window');
  _overlay = document.querySelector('.overlay');
  _buttonOpenNewRecipeModal = document.querySelector('.nav__btn--add-recipe');
  _buttonCloseNewRecipeModal = document.querySelector('.btn--close-modal');

  _message = 'Recipe was successfully uploaded!';

  constructor() {
    super();
    this._addHandlerShowModal();
    this._addHandlerHideWindow();
  }

  toggleWindow() {
    this._window.classList.toggle('hidden');
    this._overlay.classList.toggle('hidden');
  }

  _addHandlerShowModal() {
    this._buttonOpenNewRecipeModal.addEventListener(
      'click',
      this.toggleWindow.bind(this)
    );
  }

  _addHandlerHideWindow() {
    this._buttonCloseNewRecipeModal.addEventListener(
      'click',
      this.toggleWindow.bind(this)
    );
    this._overlay.addEventListener('click', this.toggleWindow.bind(this));
  }

  addHandlerUpload(handler) {
    this._parentElement.addEventListener('submit', function (e) {
      e.preventDefault();
      const formDataArray = [...new FormData(this)];
      const formData = Object.fromEntries(formDataArray);
      handler(formData);
    });
  }

  _generateHtml() {}
}

export default new NewRecipeView();
