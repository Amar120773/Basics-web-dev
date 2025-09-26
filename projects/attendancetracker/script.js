document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('addAttendeeForm');
    const nameInput = document.getElementById('attendeeName');
    const tableBody = document.getElementById('attendanceTable').querySelector('tbody');

    let attendees = JSON.parse(localStorage.getItem('attendees')) || [
        { id: 1, name: "Alice Johnson", status: "Present" },
        { id: 2, name: "Bob Smith", status: "Absent" },
        { id: 3, name: "Charlie Brown", status: "Late" }
    ];
    let nextId = attendees.length > 0 ? Math.max(...attendees.map(a => a.id)) + 1 : 1;


    const renderTable = () => {
        tableBody.innerHTML = ''; // Clear existing rows
        attendees.forEach((attendee, index) => {
            const row = tableBody.insertRow();
            
            row.insertCell().textContent = index + 1; 

            row.insertCell().textContent = attendee.name; 

            const statusCell = row.insertCell();
            statusCell.classList.add('status-col');
            const statusButton = document.createElement('button');
            statusButton.classList.add('status-btn', `status-${attendee.status.toLowerCase()}`);
            statusButton.textContent = attendee.status;
            statusButton.dataset.id = attendee.id;
            statusButton.addEventListener('click', cycleStatus);
            statusCell.appendChild(statusButton);

            const actionCell = row.insertCell();
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('btn', 'delete-btn');
            deleteButton.textContent = 'Remove';
            deleteButton.dataset.id = attendee.id;
            deleteButton.addEventListener('click', deleteAttendee);
            actionCell.appendChild(deleteButton);
        });
        saveAttendees();
    };

    const addAttendee = (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        if (name) {
            const newAttendee = {
                id: nextId++,
                name: name,
                status: "Absent" // Default status for new entry
            };
            attendees.push(newAttendee);
            nameInput.value = ''; // Clear the input
            renderTable();
        }
    };

    const cycleStatus = (e) => {
        const id = parseInt(e.target.dataset.id);
        const attendee = attendees.find(a => a.id === id);

        if (attendee) {
            const currentStatus = attendee.status;
            let newStatus;
            
            switch (currentStatus) {
                case "Absent":
                    newStatus = "Present";
                    break;
                case "Present":
                    newStatus = "Late";
                    break;
                case "Late":
                default:
                    newStatus = "Absent";
                    break;
            }

            attendee.status = newStatus;

            e.target.textContent = newStatus;
            e.target.className = `status-btn status-${newStatus.toLowerCase()}`;
            saveAttendees();
        }
    };

    const deleteAttendee = (e) => {
        const id = parseInt(e.target.dataset.id);
        // Use a filter to create a new array without the deleted item
        attendees = attendees.filter(a => a.id !== id);
        renderTable(); // Re-render the table
    };

    const saveAttendees = () => {
        localStorage.setItem('attendees', JSON.stringify(attendees));
    };

    form.addEventListener('submit', addAttendee);
    renderTable(); // Initial render when the page loads

});
