fetch('/api/spots')
  .then(response => response.json())
  .then(spots => {
    const list = document.getElementById('spots-list');
    spots.forEach(spot => {
      const item = document.createElement('li');
      item.textContent = `${spot.name} (${spot.location}) - Capacity: ${spot.capacity}`;
      list.appendChild(item);
    });
  });