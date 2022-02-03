import './style.css';

const app = document.querySelector('#app');
app.innerHTML = `
<div class="max-w-screen-md px-4 py-24 mx-auto sm:px-6 lg:px-8">
   <div class="max-w-3xl mx-auto text-center mb-4">
      <h1
         class="text-3xl font-extrabold text-transparent sm:text-6xl bg-clip-text bg-gradient-to-r from-green-300 via-blue-500 to-purple-600">
         LightTodo
      </h1>
   </div>
   <div class="relative mb-5">
      <input id="td_input" class="w-full py-4 pl-3 pr-16 text-lg text-gray-400 border-2 bg-gray-700 border-gray-900 rounded-lg"
         type="text" placeholder="Today's Todo" />
      <button id="td_btn" class="absolute p-2 text-xl text-white -translate-y-1/2 bg-blue-600 rounded-lg top-1/2 right-4"
         type="submit">+</button>
   </div>
   <div class="p-4  border border-gray-700 rounded-xl">
      <div class="flex justify-around">
         <button type="button" id="tds_delete" class="p-2 bg-blue-600 leading-none text-sm font-medium border rounded-lg text-gray-300">
            Clear All Todos
         </button>
         <p id='td_count' class="p-2 px-3 bg-blue-900 leading-none text-sm font-medium border rounded-lg text-gray-300">Todo: 0</p>
         <button type="button" id="tds_clear" class="p-2 bg-blue-600 leading-none text-sm font-medium border rounded-lg text-gray-300">
            X Completed Todos
         </button>
      </div>
      <ul id="td_ul" class="mt-4 space-y-3">
      </ul>
   </div>
</div>
`;

class Store {
   constructor() {
      this.store = JSON.parse(localStorage.getItem('todos')) ?? [];
   }

   addItem = (label) => {
      this.store = [
         ...this.store,
         {
            id: this.store.length,
            label,
            completed: 0,
            createdAt: Date.now(),
            deletedAt: undefined,
            pinned: false
         },
      ];
      // console.log(this.store);
   };

   deleteItem = (id) => {
      this.store = this.store.filter((todo) => todo.id !== id);
   };
   clearItems = () => {
      this.store = this.store.filter((todo) => !todo.completed);
   };

   clearAllItems = () => {
      this.store = [];
   };
   completeItem = (id) => {
      this.store = this.store.map((todo) => {
         if (todo.id === id) {
            return {
               ...todo,
               completed: todo.completed ? false : true,
            };
         }
         return todo;
      });

   };

   _pinned = () => {
      const todos = this.store.filter((todo) => !todo.pinned);
      const pinned = this.store.filter((todo) => todo.pinned);
      this.store = Array.from([ ...pinned, ...todos ]);  // [...pinned, ...todos]
   };

   pinItem = (id) => {
      this.store = this.store.map((todo) => {
         if (todo.id === id) {
            return {
               ...todo,
               pinned: todo.pinned ? false : true,
            };
         }
         return todo;
      });
      this._pinned();
      console.log(this.store);
   };
}

class TodoItem {
   constructor({ id, label, completed, createdAt, pinned }) {
      this.id = id;
      this.label = label;
      this.completed = completed;
      this.createdAt = createdAt;
      this.pinned = pinned;
      this.init();
   }

   init = () => {
      const to_ul = app.querySelector('#td_ul');
      const to_li = document.createElement('li');

      to_li.classList.add(
         'block',
         'h-full',
         'p-4',
         'border-2',
         'border-blue-700',
         'rounded-lg',
         'hover:border-pink-600',
      );

      to_li.innerHTML = this._render();
      to_ul.append(to_li);

      this.completed ? to_li.classList.add('border-pink-600', 'bg-gray-900') : '';
      this.pinned ? to_li.classList.add('border-pink-800', 'bg-gray-900') : '';

      const to_del = to_li.querySelector('#td_del');
      to_del.addEventListener('click', this._delete);

      const to_pin = to_li.querySelector('#td_pin');
      to_pin.addEventListener('click', this._pin);

      const to_clear = to_li.querySelector('#td_clear');
      to_clear.addEventListener('change', this._complete);
   };
   _pin = (e) => {
      e.preventDefault();
      e.stopPropagation();
      // e.target.classList.toggle('bg-red-900');
      ctrl.pinTodo(this.id);
   };

   _complete = (e) => {
      e.preventDefault();
      ctrl.completeTodo(this.id);
   };

   _delete = (e) => {
      e.preventDefault();
      ctrl.deleteTodo(this.id);
   };

   _getTime = () => {
      return new Date(this.createdAt)
         .toString()
         .split(' ')
         .slice(1, 5)
         .join(' ');
   };
   _render = () => {
      return `
         <div class="flex space-x-3">
         <input id="td_clear" type="checkbox" class="border h-6 w-6 align-middle"${this.completed ? ' checked' : ''
         }>
         <h5 class="text-white text-sm">${this._getTime()}</h5>
         </div>
         <p class="${this.completed ? 'line-through' : ''} mt-1 ml-9 text-base font-medium text-gray-300">
            ${this.label}
         </p>
         <div class="flex items-center justify-end mt-6">
            <ul class="flex space-x-2">
               <button type="button" id="td_pin"
                  class="${this.pinned ? 'bg-red-900 ' : ''}inline-block rounded-xl text-white text-base font-medium px-3 py-1.5 bg-gray-500 hover:bg-pink-600">
                  Pin
               </button>
               <button type="button" id="td_del"
                  class="inline-block rounded-xl text-white text-xs font-medium px-3 py-1.5 bg-gray-500 hover:bg-pink-600">
                  Delete
               </button>
            </ul>
         </div>
      `;
   };
}

class UserInput {
   to_btn = app.querySelector('#td_btn');
   to_input = app.querySelector('#td_input');
   to_clear = app.querySelector('#tds_clear');
   to_delete = app.querySelector('#tds_delete');
   constructor() {
      this._init();
   }

   _init = () => {
      this.to_btn.addEventListener('click', this._add);
      this.to_clear.addEventListener('click', this._clear);
      this.to_delete.addEventListener('click', this._deleteAll);
   };
   _deleteAll = (e) => {
      e.preventDefault();
      ctrl.clearAllTodos();
   };

   _clear = (e) => {
      e.preventDefault();
      ctrl.clearTodos();
   };

   _add = (e) => {
      e.preventDefault();
      const input = this.to_input.value.trim();
      if (!input) {
         return;
      }
      ctrl.addTodo(input);
      this.to_input.value = '';
   };
}

class Controller {
   constructor(store) {
      this.store = store;
   }
   init = () => {
      new UserInput();
      this.renderTodos();

   };

   addTodo = (label) => {
      this.store.addItem(label);
      this.renderTodos();
   };

   deleteTodo = (id) => {
      this.store.deleteItem(id);
      this.renderTodos();
   };
   completeTodo = (id) => {
      this.store.completeItem(id);
      this.renderTodos();
   };
   pinTodo = (id) => {
      this.store.pinItem(id);
      this.renderTodos();
   };

   clearAllTodos = () => {
      this.store.clearAllItems();
      this.renderTodos();
   };
   clearTodos = () => {
      this.store.clearItems();
      this.renderTodos();
   };

   storage = () => {
      localStorage.setItem('todos', JSON.stringify(this.store.store));
   };

   renderTodos = () => {
      this.storage();
      app.querySelector('#td_ul').innerHTML = '';
      app.querySelector('#td_count').innerText = `Todo: ${this.store.store.filter(todo => !todo.completed).length || 0}`;
      this.store.store.forEach((todo) => {
         new TodoItem(todo);
      });
   };
}

const str = new Store();
const ctrl = new Controller(str);
ctrl.init();
