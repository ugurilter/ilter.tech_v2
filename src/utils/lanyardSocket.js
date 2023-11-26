function update_user_data(j) {
    var data = JSON.parse(j);
    const dc_status = data.d.discord_status;
    const dc_activity = data.d.activities[0];
    const statusElement = document.getElementById('status');
    const statusTxtElement = document.getElementById('statusTxt');

    const status_map = {
        'online': 'green',
        'offline': 'red',
        'idle': 'orange',
        'dnd': 'red'
    };

    if (dc_status) {
        const statusClass = status_map[dc_status] ?? '';

        if (statusElement && statusTxtElement) {
            statusElement.className = '';
            statusElement.classList.add(statusClass);
            statusElement.classList.add('circ');
            statusTxtElement.textContent = 'Currently ' + dc_status;
            statusElement.setAttribute('title', dc_status);
        }
    }

    if (dc_activity) {
        const activityElement = document.getElementById('activity');

        if (activityElement && dc_activity.name === 'YouTube Music') {
            activityElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" /></svg>';
            activityElement.innerHTML += 'Listening to: ' + dc_activity.state + ' - ' + dc_activity.details;
        } else if (activityElement && dc_activity.name === 'Custom Status') {
            activityElement.innerHTML =  dc_activity.state + dc_activity.emoji.name;
        } else if (activityElement && !dc_activity.state && !dc_activity.details) {
            activityElement.innerHTML = 'Playing: ' + dc_activity.name;
        }
    } else {
        const activityElement = document.getElementById('activity');

        if (activityElement) {
            activityElement.innerHTML = 'Doing nothing...';
        }
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const socket = new WebSocket("wss://api.lanyard.rest/socket");
    let data = { subscribe_to_id: '144871706257784832' };
    let type = 'one';
    let Users = new Map();

    socket.onopen = () => console.log("opened socket connection");

    socket.onmessage = (event) => {
        const json = JSON.parse(event.data);

        switch (json.op) {
            case 1: {
                if (socket.readyState == socket.OPEN) {
                    socket.send(JSON.stringify({ op: 2, d: data }));
                }

                setInterval(() => {
                    if (socket.readyState == socket.OPEN) {
                        socket.send(JSON.stringify({ op: 3 }));
                    }
                }, json.d.heartbeat_interval);

                break;
            }

            case 0: {
                switch (json.t) {
                    case "INIT_STATE": {
                        Users = new Map([[json.d.discord_user.id, json.d]]);
                        update_user_data(event.data);
                        break;
                    }
                    case "PRESENCE_UPDATE": {
                        Users.set(json.d.discord_user.id, json.d);
                        update_user_data(event.data);
                        break;
                    }
                }
            }
        }

    };
});