const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');

addTaskBtn.addEventListener('click', addTask);

taskInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        addTask();
    }
});


function addTask() {
    const taskText = taskInput.value.trim();


    if (taskText === "") {
        alert("Please enter a task!");
        return;
    }

    const listItem = document.createElement('li');
    listItem.innerHTML = `
        <span>${taskText}</span>
        <button class="delete-btn">×</button>
    `;

    listItem.addEventListener('click', function() {
        listItem.classList.toggle('completed');
    });

    const deleteBtn = listItem.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', function(e) {
        e.stopPropagation(); 
        taskList.removeChild(listItem);
    });


    taskList.appendChild(listItem);

    
    taskInput.value = '';
    taskInput.focus();

}
