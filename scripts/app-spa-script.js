class TaskManager {
  constructor(taskListInstance) {
    this.arrayList = [];
    this.taskListUi = taskListInstance;
  }

  getTasksFromDb() {
    const tasks = TaskService.fetchTasks();
    return tasks;
  }

  async sortTasks() {
    const tasksFromDb = await this.getTasksFromDb();

    const sortedTasks = tasksFromDb.sort((a, b) => {
      if (a.listindex > b.listindex) {
        return 1;
      } else if (a.listindex === b.listindex) {
        return 0;
      } else {
        return -1;
      }
    });

    return sortedTasks;
  }

  async getTasks() {
    const sortedTasks = await this.sortTasks();

    sortedTasks.forEach((taskFromDb, index) => {
      if (!taskFromDb) {
        return;
      }

      const task = new Task( taskFromDb.title, taskFromDb.description, taskFromDb.priority, taskFromDb.to_finish, taskFromDb.listindex, taskFromDb.idtask);
      this.arrayList.push(task);

      this.taskListUi.renderTaskList(task);
    });

    return this.arrayList;
  }

  async addNewTask(title, description, toFinishDate, priority) {
    const task = new Task( title, description, priority, toFinishDate, this.arrayList.length);
    const taskId = await TaskService.addTask( title, description, toFinishDate, priority, this.arrayList.length);
    task.id = taskId;
    this.arrayList.push(task);

    this.arrayList.forEach((taskForDb, index) => {
      this.arrayList[index].index = index;
      taskForDb.index = index;

      TaskService.updateTaskListBackend(taskForDb.index, taskForDb.id);
    });
    this.taskListUi.appendNewTask(task);
  }

  removeTask(taskId) {
    const indexFromRemovedItem = this.arrayList.findIndex(
      (item, index, list) => {
        return item.id === parseInt(taskId);
      }
    );
    TaskService.deleteTask(taskId);
    this.arrayList.splice(indexFromRemovedItem, 1);
    this.arrayList.forEach((task, index) => {
      TaskService.updateTaskListBackend(index, task.id);
      this.arrayList[index].index = index;
    });
  }

  async updateTaskList(listItemObject) {
    const updatetTask = this.findItem(listItemObject);
    if (listItemObject.date === "") {
      listItemObject.date = null;
    }

    if (!listItemObject.priority) {
      listItemObject.priority = null;
    }
    await TaskService.updateTaskListBackend(updatetTask.index, updatetTask.id);
    await TaskService.updateSingleTask( listItemObject.id, listItemObject.title, listItemObject.description, listItemObject.priority, listItemObject.date);
  }

  findItem(listItemObject) {
    const index = this.arrayList.findIndex((task, index, tasks) => {
      return parseInt(listItemObject.id) === parseInt(task.id);
    });
    this.arrayList[index].id = listItemObject.id;
    this.arrayList[index].index = listItemObject.index;
    this.arrayList[index].title = listItemObject.title;
    this.arrayList[index].description = listItemObject.description;
    return this.arrayList[index];
  }
}

class TaskListUI {
  constructor() {
    this.updateForm = this.initNewFormElement();
    this.addTaskWindow = this.addNewFormElement();
    this.taskList = document.querySelector(".task-list");
 
    this.listItemObject = {
      listItem: null,
      id: null,
      title: null,
      description: null,
      priority: "",
      date: "",
    };

    this.draggedItem;
    this.dragstart = false;
    this.drag = false;
    this.formActive = false;
    this.startX;
    this.startY;
    this.initialLeft;
    this.initialTop;
    this.addListenerToTaskList();
  }

  setArrayFromTaskManager(setArray, setUpdateFunction, removeTaskFunction) {
    this.arrayList = setArray;
    this.updateFunction = setUpdateFunction;
    this.removeTaskFunction = removeTaskFunction;
  }

  setPrioritys(data, elemente) {
    const priority = elemente.querySelector("#priority");

    data.forEach((item) => {
      const option = document.createElement("option");
      option.textContent = item.priority;
      option.value = item.idpriority;
      priority.appendChild(option);
    });
  }

  addNewFormElement() {
    const addFormElement = document.createElement("li");

    addFormElement.setAttribute("class", "add__list__item");

    addFormElement.innerHTML = `
        <div id="add-form"> 
        <p class="add__list__item__title_wrapper ">
          
          <input class="add__list__item__title" type="text" placeholder="Titel" name="utitle" id="utitle">
        </p>
    
        <p class="add__list__item__description_wrapper">
         
          <input class="add__list__item__description" type="text" placeholder="Beschreibung" name="udescription" id="udescription">
        </p>
                    <section class="modal__body__section__two">
                 
                  <div class="modal__body__section__two__date">
                    <span class="modal__body__section__two__input">Fälligkeitsdatum</span>
                      <input type="date" class="modal__body__section__two__input--date" name="date" id="date">
                    </div>
                    <select name="priority" id="priority">
                      <option value="" disabled selected>Priorität</option>
                    </select>
                    
                </section>
                <hr>
    <div class="add__list__item__footer">
    <button id="cancel-btn" class="add__list__item__button add__list__item__button--cancel">Abbrechen</button>
    <button id="add-task" type="button" class="add__list__item__button add__list__item_button--submit">Aufgabe hinzufügen</button>
    </div>
    
    </div>`;

    
    const dateContainerForUpdateForm =  addFormElement.querySelector(
      ".modal__body__section__two__date"
    );
    const dateInput = dateContainerForUpdateForm.querySelector("#date");
    dateInput.addEventListener("click", function () {
        dateContainerForUpdateForm.style.backgroundColor = "transparent";
        dateInput.style.opacity = "1";
      }.bind(this)
    );

    return addFormElement;
  }

  initNewFormElement() {
    const updateFormElement = document.createElement("li");

    updateFormElement.setAttribute("class", "update__list__item");

    updateFormElement.innerHTML = `
        <div id="update-form"> 
        <p class="update__list__item__title_wrapper ">
          
          <input class="update__list__item__title" type="text" placeholder="Titel" name="utitle" id="utitle">
        </p>
    
        <p class="update__list__item__description_wrapper">
         
          <input class="update__list__item__description" type="text" placeholder="Beschreibung" name="udescription" id="udescription">
        </p>
                    <section class="modal__body__section__two">
                 
                  <div class="modal__body__section__two__date">
                    <span class="modal__body__section__two__input">Fälligkeitsdatum</span>
                      <input type="date" class="modal__body__section__two__input--date" name="date" id="date">
                    </div>
                    <select name="priority" id="priority">
                      <option value="" disabled selected>Priorität</option>
                    </select>
                </section>
                <hr>
    <div class="update__list__item__footer">
    <button id="cancel-btn" class="update__list__item__button update__list__item__button--cancel">Abbrechen</button>
    <button id="update-task" type="button" class="update__list__item__button update__list__item_button--submit">Bearbeiten</button>
    </div>
    
    </div>`;

    const dateContainerForUpdateForm = updateFormElement.querySelector(".modal__body__section__two__date");
    const dateInput = dateContainerForUpdateForm.querySelector("#date");
    dateInput.addEventListener("click",function () {
        dateContainerForUpdateForm.style.backgroundColor = "transparent";
        dateInput.style.opacity = "1";
      }.bind(this)
    );

    return updateFormElement;
  }

  addListenerToTaskList() {
    this.taskList.addEventListener("click", this.initListener.bind(this));
    this.taskList.addEventListener("mousedown", this.itemSelected.bind(this));
    this.taskList.addEventListener("mousemove", this.moveElement.bind(this));
    window.addEventListener("mouseup", this.stopDrag.bind(this));
  }

  itemSelected(event) {
    if (event.target.closest("li").classList.contains("tasklist__body__item")) {
      this.dragstart = true;

      this.startX = event.clientX;
      this.startY = event.clientY;

      this.dummy = document.createElement("li");
      this.draggedItem = event.target.closest("li");

      this.elementHeight = this.draggedItem.offsetHeight;
      this.elementWidth = this.draggedItem.offsetWidth;
      this.mousetElement = event.offsetY;

      this.initialLeft = this.draggedItem.getBoundingClientRect().left;
      this.initialTop = this.draggedItem.getBoundingClientRect().top;
    }
  }

  moveElement(event) {
    if (this.dragstart) {
      let threshold = 10;
      if (this.moving === true) {
        threshold = 0;
      }
      let difX = this.startX - event.clientX;
      let difY = this.startY - event.clientY;
 
      if (event.target.closest("li")) {
        if (difY > threshold || -difY > threshold) {
          threshold = 0;
          this.moving = true;

          document.body.style.userSelect = "none";
          this.dummy.classList.add("task-list");
          this.dummy.style.backgroundColor = "rgba(233, 231, 231, 0.88)";
          this.dummy.style.height = "50px";

          const cli = event.target.closest("li");
          cli.insertAdjacentElement("afterend", this.dummy);

          this.dummy.classList.add("grabbing");
          this.taskList.classList.add("grabbing");
          this.draggedItem.classList.add("pointer-events--disabled");

          const offsetX = event.clientX - this.startX;
          const offsetY = event.clientY - this.startY;
          this.draggedItem.style.position = "fixed";

          this.draggedItem.style.backgroundColor = "white";
          this.draggedItem.style.borderRadius = "6px";
          this.draggedItem.style.boxShadow =
            "0 0 50px 10px rgba(14, 14, 14, 0.336)";

          let positionForLeft = this.initialLeft + offsetX;
          let positionForTop = this.initialTop + offsetY;

          this.draggedItem.style.left = positionForLeft + "px";
          this.draggedItem.style.top = positionForTop + "px";
        }
      }
    }
  }

  stopDrag(event) {
    if (this.dragstart) {
      this.dragstart = false;
      this.moving = false;

      this.draggedItem.classList.remove("pointer-events--disabled");
      this.taskList.classList.remove("grabbing");

      this.draggedItem.style.position = "";
      this.draggedItem.style.backgroundColor = "";
      this.draggedItem.style.borderRadius = "";
      this.draggedItem.style.boxShadow = "";

      this.dummy.replaceWith(this.draggedItem);

      this.listItemObject.id = this.draggedItem.dataset.id;
      this.listItemObject.index = parseInt(
        this.draggedItem.nextElementSibling.dataset.index
      );

      const allLi = document.querySelectorAll(".task.tasklist__body__item");

      allLi.forEach((task, index) => {
        task.dataset.index = index;

        this.arrayList[index].index = task.dataset.index;

        TaskService.updateTaskListBackend(parseInt(task.dataset.index), parseInt(task.dataset.id));
      });

    }

  }

  async initListener(event) {
    let button = event.target.closest("button");
    let listItem = event.target.closest("li");
    let commentWindowActive = true;
    if (button) {
      commentWindowActive = false;

      if (button.classList.contains("edit-btn")) {
        this.formActive = true;

        if (this.isEditing) {
          this.updateForm.replaceWith(this.isEditing);
          this.isEditing = null;
        }

        this.listItemObject.listItem = listItem;
        if (listItem.classList.contains("task_item_priority")) {
          this.listItemObject.priority = parseInt(
            listItem.querySelector(".task_item_priority").textContent
          );
        };

        this.listItemObject.date = listItem.querySelector(".task_item_expiration_date").textContent;

        this.listItemObject.id = listItem.dataset.id;
        this.listItemObject.title = listItem.querySelector(".title").textContent;
        this.listItemObject.description = listItem.querySelector(".description").textContent;
        if (listItem.querySelector(".task_item_priority").textContent) {
          this.listItemObject.priority = parseInt( listItem.querySelector(".task_item_priority").textContent);
        }

        this.updateForm.querySelector("#priority").value = this.listItemObject.priority;
        this.updateForm.querySelector(".update__list__item__title").value = this.listItemObject.title;
        this.updateForm.querySelector(".update__list__item__description").value = this.listItemObject.description;

        this.listItemObject.priority = "";

        const dateContainerForUpdateForm =  this.updateForm.querySelector(".modal__body__section__two__date");
        const dateInput = dateContainerForUpdateForm.querySelector("#date");  
        dateContainerForUpdateForm.style.backgroundColor = "transparent";
        dateInput.style.opacity = "1";
        
        if (!this.listItemObject.date) {
          this.listItemObject.date = "";
          dateInput.style.opacity = "0";
          dateContainerForUpdateForm.style.backgroundColor = "var(--background-red)";
        };
  
        this.updateForm.querySelector(".modal__body__section__two__input--date").value = this.listItemObject.date;

        this.clone = listItem.cloneNode(true);

        this.isEditing = this.clone;

        listItem.replaceWith(this.updateForm);
      }

      if (button.classList.contains("btn-delete")) {
        const deleteItem = event.target.closest("li");

        this.removeTaskFunction(deleteItem.dataset.id);

        deleteItem.remove();

      }

      if (button.classList.contains("more__menu")) {
        const userMenu = new Menu(button);
        userMenu.createAnotherMenu([
          { id: 1, icon: '<svg id="arrow-up" width="70" height="70" viewBox="-32 -32 96.00 96.00" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>arrow-up-circle</title> <desc>Created with Sketch Beta.</desc> <defs> </defs> <g id="Page-1" stroke-width="2.08" fill="none" fill-rule="evenodd" sketch:type="MSPage"> <g id="Icon-Set" sketch:type="MSLayerGroup" transform="translate(-360.000000, -1087.000000)" fill="#000000"> <path d="M376,1117 C368.268,1117 362,1110.73 362,1103 C362,1095.27 368.268,1089 376,1089 C383.732,1089 390,1095.27 390,1103 C390,1110.73 383.732,1117 376,1117 L376,1117 Z M376,1087 C367.163,1087 360,1094.16 360,1103 C360,1111.84 367.163,1119 376,1119 C384.837,1119 392,1111.84 392,1103 C392,1094.16 384.837,1087 376,1087 L376,1087 Z M376.879,1096.46 C376.639,1096.22 376.311,1096.15 376,1096.21 C375.689,1096.15 375.361,1096.22 375.121,1096.46 L369.465,1102.12 C369.074,1102.51 369.074,1103.14 369.465,1103.54 C369.854,1103.93 370.488,1103.93 370.879,1103.54 L375,1099.41 L375,1110 C375,1110.55 375.447,1111 376,1111 C376.553,1111 377,1110.55 377,1110 L377,1099.41 L381.121,1103.54 C381.512,1103.93 382.145,1103.93 382.535,1103.54 C382.926,1103.14 382.926,1102.51 382.535,1102.12 L376.879,1096.46 L376.879,1096.46 Z" id="arrow-up-circle" sketch:type="MSShapeGroup"> </path> </g> </g> </g></svg>', content: "Aufgabe oben hinzufügen" },
          { id: 2, icon: '<svg id="arrow-down" width="70" height="70" viewBox="-32 -32 96.00 96.00" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>arrow-down-circle</title> <desc>Created with Sketch Beta.</desc> <defs> </defs> <g id="Page-1" stroke-width="2.08" fill="none" fill-rule="evenodd" sketch:type="MSPage"> <g id="Icon-Set" sketch:type="MSLayerGroup" transform="translate(-412.000000, -1087.000000)" fill="#000000"> <path d="M428,1117 C420.268,1117 414,1110.73 414,1103 C414,1095.27 420.268,1089 428,1089 C435.732,1089 442,1095.27 442,1103 C442,1110.73 435.732,1117 428,1117 L428,1117 Z M428,1087 C419.163,1087 412,1094.16 412,1103 C412,1111.84 419.163,1119 428,1119 C436.837,1119 444,1111.84 444,1103 C444,1094.16 436.837,1087 428,1087 L428,1087 Z M433.121,1102.46 L429,1106.59 L429,1096 C429,1095.45 428.553,1095 428,1095 C427.448,1095 427,1095.45 427,1096 L427,1106.59 L422.879,1102.46 C422.488,1102.07 421.855,1102.07 421.465,1102.46 C421.074,1102.86 421.074,1103.49 421.465,1103.88 L427.121,1109.54 C427.361,1109.78 427.689,1109.85 428,1109.79 C428.311,1109.85 428.639,1109.78 428.879,1109.54 L434.535,1103.88 C434.926,1103.49 434.926,1102.86 434.535,1102.46 C434.146,1102.07 433.512,1102.07 433.121,1102.46 L433.121,1102.46 Z" id="arrow-down-circle" > </path> </g> </g> </g></svg>', content: "Aufgabe unten hinzufügen" },
        ]);
        userMenu.styleButton(true, "menu-settings");
        userMenu.showMenuOnList(button);
       
        userMenu.setAction( userMenu.menuButtons[0].button, this.addTask.bind(this, listItem, "above"));
        userMenu.setAction( userMenu.menuButtons[1].button, this.addTask.bind(this, listItem, "below"));

      }

      if (button.classList.contains("update__list__item__button--cancel")) {
        const task = event.target.closest("li");
        task.replaceWith(this.clone);
        this.formActive = false;
      }

      if (button.classList.contains("update__list__item_button--submit") && !button.getAttribute("action")) {
        this.updateTask(this.listItemObject);

        this.updateFunction(this.listItemObject);
        this.formActive = false;
        const getAllTasksForIndex = document.querySelector(".tasklist__body");
        getAllTasksForIndex.querySelectorAll("li").forEach((task, index) => {
          task.dataset.index = index;
          TaskService.updateTaskListBackend( parseInt(task.dataset.index), parseInt(task.dataset.id));
        });
      };

      if (button.classList.contains("add__list__item_button--submit")) {
        event.target.closest("li").nextElementSibling;

        const taskTitle = this.addTaskWindow.querySelector(".add__list__item__title");
        const taskDescription = this.addTaskWindow.querySelector(".add__list__item__description");
        const priority = this.addTaskWindow.querySelector("#priority");
        const toFinishDate = this.addTaskWindow.querySelector("#date");
        const getAllTasksForIndex = document.querySelector(".tasklist__body");
      
        const newTask = new Task( taskTitle.value, taskDescription.value, priority.value, toFinishDate.value );
        const taskId = await TaskService.addTask( taskTitle.value, taskDescription.value, toFinishDate.value, priority.value, newTask.index);
        newTask.id = taskId;
        this.arrayList.push(newTask);

        
        taskTitle.value = "";
        taskDescription.value = "";
        priority.value = "";
        toFinishDate.value = "";
        this.addTaskWindow.replaceWith(newTask.renderTask());

        getAllTasksForIndex.querySelectorAll("li").forEach((task, index) => {
          task.dataset.index = index;
          TaskService.updateTaskListBackend( parseInt(task.dataset.index), parseInt(task.dataset.id));
        });
      }

      if (button.classList.contains("add__list__item__button--cancel")) {
        const formElement = event.target.closest("li");
        const taskTitle = formElement.querySelector(".add__list__item__title");
        const taskDescription = formElement.querySelector(".add__list__item__description");
        taskTitle.value = "";
        taskDescription.value = "";
        formElement.remove();
      }
    }

    if (commentWindowActive && listItem.classList.contains("task")) {
      const commentWindowActive = new CommentModal();
      const taskId = listItem.dataset.id;
      commentWindowActive.setCommentWindow(taskId);
      commentWindowActive.getData(taskId);
      commentWindowActive.getCommentField();
      commentWindowActive.reqisterSubmitButton(taskId);

    }
  }

  addTask(listItem, condition) {
    const addTaskWindow = this.addTaskWindow;

    const cancelButton = addTaskWindow.querySelector(".update__list__item__button--cancel");

    let taskIndexFromArray = listItem.dataset.index;

    if (condition === "above") {
      taskIndexFromArray = parseInt(listItem.dataset.index);
      this.addTaskWindow.dataset.index = taskIndexFromArray.toString();
      listItem.insertAdjacentElement("beforebegin", this.addTaskWindow);

    } else if (condition === "below") {

      taskIndexFromArray = parseInt(listItem.dataset.index) + 1;
      this.addTaskWindow.dataset.index = taskIndexFromArray.toString();
      listItem.insertAdjacentElement("afterend", this.addTaskWindow);
    }

  }

  updateTask(listItemObject) {
    let title = this.updateForm.querySelector(".update__list__item__title").value;
    let description = this.updateForm.querySelector(".update__list__item__description").value;
    let priority = this.updateForm.querySelector("#priority").value;
    let date = this.updateForm.querySelector("#date").value;

    listItemObject.listItem.querySelector(".title").textContent = title;
    listItemObject.listItem.querySelector(".description").textContent = description;
    listItemObject.listItem.querySelector(".task_item_priority").textContent = ' ' + priority;
   
    if (date === "") {
   
      listItemObject.listItem.querySelector(".task_item_expiration_date").textContent = '';
      
    } else {
      listItemObject.listItem.querySelector(".task_item_expiration_date").parentElement.firstChild.textContent = '';

      listItemObject.listItem.querySelector(".task_item_expiration_date").textContent = 'Fälligkeitsdatum: ' + date;
    };
    listItemObject.title = title;
    listItemObject.description = description;
    listItemObject.priority = priority;
    listItemObject.date = date;

    if (priority) {
      listItemObject.listItem.querySelector(".priority-label").textContent =
        "Priorität:";
    } else {
      listItemObject.listItem.querySelector(".priority-label").textContent = "";
    }

    this.updateForm.replaceWith(listItemObject.listItem);

  }

  renderTaskList(task) {
    this.taskList.append(task.renderTask());
  }

  appendNewTask(task) {
    this.taskList.insertAdjacentElement("beforeend", task.renderTask());
  }
}


class TaskService {
  static async fetchSingleTask(taskId) {
    console.log(taskId)
    const response = await fetch("/getSingleTask", {
      method: "POST",
      body: JSON.stringify({
        taskId: parseInt(taskId),
      }),
      headers: { "Content-Type": "application/json" },
    });
    const task = await response.json();
    return task;
  }


  static async fetchTasks() {
    const response = await fetch("/getTasks", { credentials: "include" });
    const tasks = await response.json();

    return tasks;
  }

  static async addTask(
    taskTitle,
    taskDescription,
    toFinishDate,
    priority,
    index
  ) {
    let response;

    response = await fetch("/addTask", {
      method: "POST",
      body: JSON.stringify({
        title: taskTitle,
        description: taskDescription,
        toFinishDate: toFinishDate,
        priority: parseFloat(priority),
        index: index,
      }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    response = await response.json();

    return response;
  }

  static async updateTaskListBackend(index, taskId) {
    await fetch("/update-tasks-index", {
      method: "POST",
      body: JSON.stringify({
        index: index,
        taskId: taskId,
      }),
      headers: { "Content-Type": "application/json" },
    });
  }

  static async deleteTask(task_id) {
    await fetch("/delete-task", {
      method: "POST",
      body: JSON.stringify({ id: task_id }),
      headers: { "Content-Type": "application/json" },
    });
  }

  static async updateSingleTask(task_id, title, description, priority, date) {
    console.log(priority, date);
    await fetch("/update-task", {
      method: "POST",
      body: JSON.stringify({
        id: task_id,
        title: title,
        description: description,
        priority: priority,
        date: date,
      }),
      headers: { "Content-Type": "application/json" },
    });
  }
}

class Task {
  constructor(taskTitle, taskDescription, taskPriority, date, index, id) {
    this.taskTitle = taskTitle;
    this.taskDescription = taskDescription;
    this.taskPriority = taskPriority;
    this.date = date;
    this.index = index;
    this.id = id;
  }

  renderTask() {
   
    this.task = document.createElement("li");
    this.task.classList.add("task");
    this.task.classList.add("tasklist__body__item");
    this.task.setAttribute("data-id", this.id);
    this.task.setAttribute("data-index", this.index);

    if (!this.taskPriority) {
      this.taskPriority = "";
      this.taskPriorityDescription = ``;
    } else {
      this.taskPriorityDescription = `Priorität: `;
      this.taskPriority = `${this.taskPriority}`;
    }

    if (!this.date) {
      this.date = "";
      this.dateDescription = ``;
    } else {
  
      this.dateDescription = `Fälligkeitsdatum: `;
    }

    this.task.innerHTML = `
                <div class="svg__button tasklist__item__btn-container">
                  <button class="btn-delete tasklist__item__btn--delete"><svg width="24px" height="24px" viewBox="-2.4 -2.4 28.80 28.80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="grey" fill="none"></circle>
                  <path class="checkmark" d="M9 12.5L11 15L15 9" stroke="green" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"></path></svg></button>
                </div>         
                <div class="task__body__container tasklist__item__container">
                <div>
                <span class="priority-label">${this.taskPriorityDescription}</span><span class="task_item_priority">${this.taskPriority}</span>
                </div>
                <p class="title tasklist__item__title">${this.taskTitle}</p>
                <p class="description tasklist__item__description">${this.taskDescription}</p>
                <div><span>${this.dateDescription}</span><span class="task_item_expiration_date">${this.date}</span></div>
                  </div> 
                    <div class="svg__button tasklist__item__btn-container" style="position: relative;">
                      <button class="edit-btn tasklist__item__btn--edit"><svg width="24" height="24"><g fill="grey" fill-rule="grey"><path fill="grey" d="M9.5 19h10a.5.5 0 1 1 0 1h-10a.5.5 0 1 1 0-1z"></path><path stroke="grey" d="M4.42 16.03a1.5 1.5 0 0 0-.43.9l-.22 2.02a.5.5 0 0 0 .55.55l2.02-.21a1.5 1.5 0 0 0 .9-.44L18.7 7.4a1.5 1.5 0 0 0 0-2.12l-.7-.7a1.5 1.5 0 0 0-2.13 0L4.42 16.02z"></path></g></svg></button>
                      <button><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="grey" viewBox="0 0 24 24"><path fill="grey" fill-rule="grey" d="M18 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2ZM5 6a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6Zm12 10a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM7 8a.5.5 0 0 0 0 1h10a.5.5 0 0 0 0-1H7Z" clip-rule="grey"></path></svg></button>
                      <button><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" data-svgs-path="sm1/comments.svg"><path fill="grey" fill-rule="grey" d="M11.707 20.793A1 1 0 0 1 10 20.086V18H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4.5l-2.793 2.793zM11 20.086L14.086 17H19a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h6v3.086z"></path></svg></button>
                      <button class="more__menu"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><g fill="grey" stroke="grey" stroke-linecap="round" transform="translate(3 10)"><circle cx="2" cy="2" r="2"></circle><circle cx="9" cy="2" r="2"></circle><circle cx="16" cy="2" r="2"></circle></g></svg></button>
                  </div>
              </li>`;

    return this.task;
  }
}

class Menu {
  constructor(button) {
    this.button = button;
    this.menu = document.createElement("div");
    this.menu.setAttribute("class", "more__menu__container");
    this.menuButtons = [];
    this.backDrop = document.getElementById("backdrop");
    this.backDrop.addEventListener("click", this.closeMenu.bind(this));
 
  }

  closeMenu() {
    document.body.classList.remove("no-scroll");
    this.backDrop.classList.remove("backdrop--activ");
    this.menu.remove();
  }

  setAction(button, cb) {
    button.addEventListener("click", this.closeMenu.bind(this));
    button.addEventListener("click", cb);
  }

  styleButton(allButtons, className, buttonName) {
    const buttons = this.menu.querySelectorAll("li");

    for (const button of buttons) {
      if (allButtons) {
        button.classList.add(className);
      }
    }
    if (!allButtons) {
      if (button.textContent === buttonName) {
        button.classList.add(className);
        return;
      }
    }
  }

  createAnotherMenu(menuItems, callback) {
    this.menuList = document.createElement("ul");
    menuItems.forEach((item) => {
      const newItem = document.createElement("li");
      const textWrapper = document.createElement("span");
  
      newItem.dataset.id = item.id;
      textWrapper.textContent = item.content;
      
      newItem.appendChild(textWrapper);
      this.menuButtons.push({ button: newItem });

      if(item.icon) {
        const icon = document.createElement("span");
        icon.innerHTML = item.icon;
        newItem.append(icon); 
      } 

      this.menuList.appendChild(newItem);
    });
    this.menu.appendChild(this.menuList);

  }

  showMenu() {
    this.backDrop.classList.add("backdrop--activ");
    document.body.classList.add("no-scroll");
    this.button.style.position = "relative";
    this.button.appendChild(this.menu);
    this.menu.style.position = "absolute";
    this.menu.style.top = "0";
    this.menu.style.left = "0";
    this.menu.style.backgroundColor = "white";
  }

  showMenuOnList(listItem) {
    this.backDrop.classList.add("backdrop--activ");
    document.body.classList.add("no-scroll");
    listItem.style.position = "relative";
    listItem.appendChild(this.menu);
    this.menu.style.position = "absolute";
    this.menu.style.top = "40px";
    this.menu.style.left = "0";
    this.menu.style.backgroundColor = "white";
    this.menu.style.zIndex = "100";

  }
}

class Modal {
  constructor(id) {
    this.id = id;

    this.modal = document.getElementById(this.id);
    this.taskTitle = document.getElementById("task-title");
    this.taskDescription = document.getElementById("task-description");
    this.date = document.getElementById("date");
    this.priority = document.getElementById("priority");
    this.backDrop = document.getElementById("backdrop");
  }

  async generatePrioritys(data) {
    const promisedData = await data;
    promisedData.forEach((item) => {
      const option = document.createElement("option");
      option.textContent = item.priority;
      option.value = item.idpriority;
      this.priority.appendChild(option);
    });
  }

  showModal(addTaskButton) {
    this.addTaskButton = addTaskButton;
    this.modal.style.display = "block";
    this.backDrop.classList.add("backdrop--activ");
    document.body.classList.add("no-scroll");
    this.addTaskButton.classList.add('active');
  }

  callbackFunctionFromTaskList(callback) {
    this.appendNewTask = callback;
  }

  closeModal() {
    if (this.modal.style.display === "block") {
      this.modal.style.display = "none";
      this.addTaskButton.classList.remove('active');

      this.backDrop.classList.remove("backdrop--activ");
      document.body.classList.remove("no-scroll");

      this.dateContainer.style.backgroundColor = " #d44235";
      this.dateInput.style.opacity = "0";
      this.date.value = "";
      this.priority.value = "";
    }
  }

  async sendTask(event) {
 
    const title = this.taskTitle.value;
    const description = this.taskDescription.value;
    const date = this.date.value;
    const priority = this.priority.value;

    if (!title.trim() || !description.trim()) {
      return;
    }

    this.appendNewTask(title, description, date, priority);

    this.closeModal();
    this.taskTitle.value = "";
    this.taskDescription.value = "";

  }

  addNewTask() {
    const getTaskButton = document.getElementById("new-task-btn");
    this.dateContainer = document.querySelector(
      ".modal__body__section__two__date"
    );
    this.dateInput = document.getElementById("date");
    this.dateInput.addEventListener(
      "click",
      function () {
        this.dateContainer.style.backgroundColor = "transparent";
        this.dateInput.style.opacity = "1";
      }.bind(this)
    );

    getTaskButton.addEventListener("click", this.sendTask.bind(this));
  }
}


class CommentService {

  static async fetchComments(taskId) {
    const response = await fetch('/getComments', {
      method: 'POST',
      body: JSON.stringify({ taskId: parseInt(taskId) }),
      headers: { 'Content-Type': 'application/json' },
    });
    const comments = await response.json();
    return comments;
  }

  static async setComment(taskId, comment) {
  const response = await fetch('/setComment', {
      method: 'POST',
      body: JSON.stringify({ 
        taskId: parseInt(taskId),
        comment: comment
       }),
      headers: { 'Content-Type': 'application/json' },
    });

    const comments = await response.json();
    return comments;
  }
}


class CommentModal {
  constructor() {
    this.taskId = 0;
    this.commentWindowContainer = document.getElementById("comment-window");
    this.commentField = document.createElement('div');
    this.useCommentField();
    this.backDrop = document.getElementById("backdrop");
    this.backDrop.addEventListener("click", () => {
      this.commentWindowContainer.innerHTML = "";
      this.backDrop.classList.remove("backdrop--activ-grey");
    });
  
  }

  async getData(task_id)  {
    this.commentList = this.commentWindowContainer.querySelector('ul');
    const title = this.commentWindowContainer.querySelector('.title');
    const description = this.commentWindowContainer.querySelector('.description');
    const toFinishDate = this.commentWindowContainer.querySelector('.to-Finish-date');
    const priority = this.commentWindowContainer.querySelector('.priority');

    this.commentList.innerHTML = '';
    let [task] = await TaskService.fetchSingleTask(task_id);
    let comments = await CommentService.fetchComments(task_id);

    if(task.to_finish) {
      toFinishDate.textContent = `Fälligkeitsdatum ${task.to_finish}`;
    };

    if(task.priority) {
      priority.textContent = `Priorität ${task.priority}`;
    }
    
    title.textContent = task.title;
    description.textContent = task.description;
  

    for(const comment of comments) {
      const commentItem = document.createElement('li');
      commentItem.style.margin = "5px 0";
      commentItem.textContent = comment.comment;
      this.commentList.append(commentItem);
      console.log(comment)
    }
  }

  async setComment(taskId, comment) {
   const response = await CommentService.setComment(taskId, comment);
   console.log(response);

  }

  setCommentWindow(taskId) {
    this.taskId = taskId;

    this.commentWindowContainer.innerHTML = `

    <div class="comment-window">
    <header class="comment-window__header">
      <p>Erstelle ein Kommentar</p>
      <div>
        <button><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><g fill="none" stroke="currentColor" stroke-linecap="round" transform="translate(3 10)"><circle cx="2" cy="2" r="2"></circle><circle cx="9" cy="2" r="2"></circle><circle cx="16" cy="2" r="2"></circle></g></svg></button>

        <button class="close"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path fill="currentColor"d="M5.146 5.146a.5.5 0 0 1 .708 0L12 11.293l6.146-6.147a.5.5 0 0 1 .638-.057l.07.057a.5.5 0 0 1 0 .708L12.707 12l6.147 6.146a.5.5 0 0 1 .057.638l-.057.07a.5.5 0 0 1-.708 0L12 12.707l-6.146 6.147a.5.5 0 0 1-.638.057l-.07-.057a.5.5 0 0 1 0-.708L11.293 12 5.146 5.854a.5.5 0 0 1-.057-.638z"></path></svg></button>
      </div>
    </header>
    <hr />
    <div class="comment-window-main__container"><div class="comment-window-main">
        <div class="comment-container"><p class="title">Titel</p><p class="description">Beschreibung</p><p class="to-Finish-date"></p>
          
          <div class="comment-button--submit">Kommentieren<span><svg  width="70" height="70" ViewBox="-24 -24 72.00 72.00" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M13.5 3H12H8C6.34315 3 5 4.34315 5 6V18C5 19.6569 6.34315 21 8 21H11M13.5 3L19 8.625M13.5 3V7.625C13.5 8.17728 13.9477 8.625 14.5 8.625H19M19 8.625V11.8125" stroke="#000000" stroke-width="1.56" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M17 15V18M17 21V18M17 18H14M17 18H20" stroke="#000000" stroke-width="1.56" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg></span></div>
          <p style="margin:0">Kommentare:</p>
          <ul></ul>
        </div><div class="comment-textarea"></div></div><div class="comment-window-sidebar"><div class="priority"></div>
      </div></div>
  </div>
    `;

    this.commentWindowContainer.style.display = 'none';
    setTimeout(() => {
      this.backDrop.classList.add("backdrop--activ-grey");
      this.commentWindowContainer.style.display = 'block';
      this.commentList.scrollTop = this.commentList.scrollHeight;
      this.getCloseButton();
    },100)
  };


  getCommentField() {
   
    const commentFieldButton = this.commentWindowContainer.querySelector('.comment-button--submit');

    commentFieldButton.addEventListener('click', () => {  
      this.commentWindowContainer.querySelector('.comment-textarea').appendChild(this.commentField);
    });

    this.getCancelButton();
  };

  useCommentField() {
    this.commentField.innerHTML = `
    
    <textarea class="custom-textarea" placeholder="Schreibe hier deinen Kommentar..."></textarea>
    <div class="comment-button--container">
    <button class="comment-button--cancel">Abbrechen</button>
    <button class="submit-btn comment-button--submit">Bestätigen</button>
    </div>
    `;

  }

  getCloseButton() {
    const closeButton = this.commentWindowContainer.querySelector('.close');
    closeButton.addEventListener('click', () => {
      this.commentWindowContainer.innerHTML = '';
      this.backDrop.classList.remove("backdrop--activ-grey");
    })
  }

  getCancelButton() {
    const cancelButton = this.commentField.querySelector('.comment-button--cancel');
    if (cancelButton) {

      cancelButton.addEventListener('click', () => {
        this.commentField.remove();
        this.commentField.querySelector('textarea').value = '';
      })
    }
  }

  closeCommentWindow(taskId){
    this.taskId = taskId;
    this.taskId = 0;
    this.commentWindowContainer.innerHTML = "";
  }


  reqisterSubmitButton(taskId) {

    this.commentTextarea = this.commentField.querySelector('textarea');
    const submitButton = this.commentField.querySelector('.submit-btn');
   

      submitButton.addEventListener('click', () => {
        const commentValue = this.commentTextarea.value;
        this.setComment(taskId, commentValue);
        console.log('Test')
        this.commentTextarea.value = '';
        const newComment = document.createElement('li');
        newComment.textContent = commentValue;
        this.commentList.append(newComment);
        this.commentList.scrollTop = this.commentList.scrollHeight;
      });
    };
}

class User {
  constructor() {
    this.userButton = document.querySelector("#sidebar__item--user");
    this.setUserName();
  }
  async setUserName() {
    const profilData = await this.getUserData();
    this.userButton.firstChild.textContent = profilData.firstChar;
    this.userButton.lastChild.textContent = profilData.email;
  }

  async getUserData() {
    const data = await fetch("/get-user");
    const user = await data.json();
    const createArray = Array.from(user.email);

    return { email: user.email, firstChar: createArray[0].toUpperCase() };
  }
}

class App {
  static getProfilMenu() {
    const profilButton = document.querySelector("#sidebar__item--user");
    const profilMenu = new Menu(profilButton);

    profilButton.addEventListener("click", () => {
      profilMenu.showMenuOnList(profilButton);
    });
    const profilName = profilButton.querySelector("button").textContent;

    profilMenu.createAnotherMenu([
      { id: 1, icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M4 21C4 17.134 7.13401 14 11 14C11.3395 14 11.6734 14.0242 12 14.0709M15 7C15 9.20914 13.2091 11 11 11C8.79086 11 7 9.20914 7 7C7 4.79086 8.79086 3 11 3C13.2091 3 15 4.79086 15 7ZM12.5898 21L14.6148 20.595C14.7914 20.5597 14.8797 20.542 14.962 20.5097C15.0351 20.4811 15.1045 20.4439 15.1689 20.399C15.2414 20.3484 15.3051 20.2848 15.4324 20.1574L19.5898 16C20.1421 15.4477 20.1421 14.5523 19.5898 14C19.0376 13.4477 18.1421 13.4477 17.5898 14L13.4324 18.1574C13.3051 18.2848 13.2414 18.3484 13.1908 18.421C13.1459 18.4853 13.1088 18.5548 13.0801 18.6279C13.0478 18.7102 13.0302 18.7985 12.9948 18.975L12.5898 21Z" stroke="#000000" stroke-width="1.512" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>', content: profilName },
      { id: 2, icon: '<svg width="70" height="70" viewBox="-24 -24 70.00 70.00" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M15 12L2 12M2 12L5.5 9M2 12L5.5 15" stroke="#1C274C" stroke-width="2.064" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M9.00195 7C9.01406 4.82497 9.11051 3.64706 9.87889 2.87868C10.7576 2 12.1718 2 15.0002 2L16.0002 2C18.8286 2 20.2429 2 21.1215 2.87868C22.0002 3.75736 22.0002 5.17157 22.0002 8L22.0002 16C22.0002 18.8284 22.0002 20.2426 21.1215 21.1213C20.3531 21.8897 19.1752 21.9862 17 21.9983M9.00195 17C9.01406 19.175 9.11051 20.3529 9.87889 21.1213C10.5202 21.7626 11.4467 21.9359 13 21.9827" stroke="#000000" stroke-width="2.064" stroke-linecap="round"></path> </g></svg>', content: "Abmelden" },
    ]);
    profilMenu.styleButton(true, "profil-menu");

    profilMenu.setAction(profilMenu.menuButtons[1].button, async function () {
       await fetch("/logout", {
        method: "POST",
        body: JSON.stringify({ csrfToken: document.querySelector('[data-token]').dataset.token }),

        headers: { "Content-Type": "application/json" },
      });
      window.location.href = '/';
    });
  }

  static async getPrioritys() {
    const response = await fetch("/get-prioritys");
    const data = await response.json();
    return data;
  }


  static async init() {
    const user = new User();
    setTimeout(() => {
      App.getProfilMenu();
      // Aufgrund der asynchronen Funktion von getUserData(), setTimeout muss hier gesetzt werden ein weiterer Nachteil wenn man die Daten nicht in Cookies oder localStorage speichert
    }, 500);

    const taskListUi = new TaskListUI();
    const taskManager = new TaskManager(taskListUi);
    taskListUi.setArrayFromTaskManager(taskManager.arrayList, 
      taskManager.updateTaskList.bind(taskManager), 
      taskManager.removeTask.bind(taskManager));

    taskManager.getTasks();

    const modal = new Modal("add-task-modal");

    const data = await App.getPrioritys();

    taskListUi.setPrioritys(data, taskListUi.updateForm);
    taskListUi.setPrioritys(data, taskListUi.addTaskWindow);
    modal.generatePrioritys(data);

    const addTaskButton = document.getElementById("add-task-btn");
    const cancelButton = document.getElementById("reset-btn");
    const emptyDiv = document.querySelector(".backdrop");

    addTaskButton.addEventListener("click", modal.showModal.bind(modal, addTaskButton));
    modal.callbackFunctionFromTaskList(taskManager.addNewTask.bind(taskManager));
    modal.addNewTask();

    cancelButton.addEventListener("click", modal.closeModal.bind(modal));
    emptyDiv.addEventListener("click", modal.closeModal.bind(modal));
  }
}

App.init();

