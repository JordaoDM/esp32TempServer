function updatePage(){
    axios.get('/temp')
    .then((response) => {
        //console.log(response.data);
        const data = JSON.parse(response.data);
        var temperature = document.getElementById("temperature").textContent = data.temperature + "°C";
        var humidity = document.getElementById("humidity").textContent = data.humidity + "%";
    });
}

window.onload = updatePage;