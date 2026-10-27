
const taskInput = document.querySelector("#taskInput");
const taskList = document.querySelector("#taskList");
const emptyMessage = document.querySelector("#emptyMessage");
const filterButtons = document.querySelectorAll(".filter");

let tasks = JSON.parse(localStorage.getItem("todoTasks")) || [];
let currentFilter = "all";

function saveTasks() {
    localStorage.setItem("todoTasks", JSON.stringify(tasks));
}

function formatDate(dateString) {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}.${month}.${year}, ${hours}:${minutes}`;
}

function renderTasks() {
    taskList.replaceChildren();

    const filteredTasks = tasks.filter(task => {
        if (currentFilter === "active") {
            return !task.completed;
        }

        if (currentFilter === "completed") {
            return task.completed;
        }

        return true;
    });

    filteredTasks.forEach(task => {
        const li = document.createElement("li");
        li.className = "task";

        if (task.completed) {
            li.classList.add("completed");
        }

        if (!task.completed) {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.className = "task-checkbox";
            checkbox.checked = false;
            checkbox.setAttribute("aria-label", "Позначити завдання виконаним");

            checkbox.addEventListener("change", () => {
                task.completed = true;
                saveTasks();
                renderTasks();
            });

            li.appendChild(checkbox);
        }

        const textContainer = document.createElement("div");
        textContainer.className = "task-text";

        const text = document.createElement("span");
        text.textContent = task.text;

        const date = document.createElement("span");
        date.className = "task-date";
        date.textContent = formatDate(task.createdAt);

        textContainer.append(text, date);

        textContainer.addEventListener("dblclick", () => {
            editTask(task, li);
        });

        li.appendChild(textContainer);

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.type = "button";
        deleteButton.textContent = "×";
        deleteButton.setAttribute("aria-label", "Видалити завдання");

        deleteButton.addEventListener("click", () => {
            tasks = tasks.filter(item => item.id !== task.id);
            saveTasks();
            renderTasks();
        });

        li.appendChild(deleteButton);
        taskList.appendChild(li);
    });

    emptyMessage.textContent = filteredTasks.length === 0
        ? (tasks.length === 0
            ? "Список завдань порожній"
            : "Немає завдань у цій категорії")
        : "";
}

function addTask() {
    const text = taskInput.value.trim();

    if (text === "") {
        return;
    }

    tasks.push({
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    });

    saveTasks();
    taskInput.value = "";
    currentFilter = "all";
    updateFilters();
    renderTasks();
}

function editTask(task, li) {
    if (task.completed) {
        return;
    }

    const textContainer = li.querySelector(".task-text");
    const editInput = document.createElement("input");

    editInput.type = "text";
    editInput.className = "edit-input";
    editInput.value = task.text;
    editInput.setAttribute("aria-label", "Редагувати завдання");

    textContainer.replaceWith(editInput);
    editInput.focus();
    editInput.select();

    let finished = false;

    function finishEditing(save) {
        if (finished) {
            return;
        }

        finished = true;

        if (save && editInput.value.trim() !== "") {
            task.text = editInput.value.trim();
            saveTasks();
        }

        renderTasks();
    }

    editInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            finishEditing(true);
        }

        if (event.key === "Escape") {
            finishEditing(false);
        }
    });

    editInput.addEventListener("blur", () => {
        finishEditing(true);
    });
}

function updateFilters() {
    filterButtons.forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.filter === currentFilter
        );
    });
}

taskInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        addTask();
    }
});

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;
        updateFilters();
        renderTasks();
    });
});

renderTasks();
