const typeColors = {
    normal: "#A8A77A", fire: "#EE8130", water: "#6390F0", electric: "#F7D02C",
    grass: "#7AC74C", ice: "#96D9D6", fighting: "#C22E28", poison: "#A33EA1",
    ground: "#E2BF65", flying: "#A98FF3", psychic: "#F95587", bug: "#A6B91A",
    rock: "#B6A136", ghost: "#735797", dragon: "#6F35FC", dark: "#705746",
    steel: "#B7B7CE", fairy: "#D685AD"
};

const statNamesEs = {
    hp: "PS", attack: "ATAQUE", defense: "DEFENSA",
    "special-attack": "ATAQUE ESP.", "special-defense": "DEF. ESP.",
    speed: "VELOCIDAD"
};

async function getRandomPokemon() {
    const maxPokemon = 1025;
    const id = Math.floor(Math.random() * maxPokemon) + 1;
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await res.json();

    document.getElementById("pokemon-image").src = data.sprites.other["official-artwork"].front_default;
    document.getElementById("pokemon-name").textContent = data.name.toUpperCase();
    document.getElementById("pokemon-id").textContent = `#${data.id}`;

    // Altura y peso
    document.getElementById("pokemon-height").textContent = `Altura: ${data.height / 10} m`;
    document.getElementById("pokemon-weight").textContent = `Peso: ${data.weight / 10} kg`;

    // Tipos
    const typesContainer = document.getElementById("pokemon-types");
    typesContainer.innerHTML = "<strong>TIPOS:</strong><br>";
    const typeNames = data.types.map(t => t.type.name);
    typeNames.forEach(type => {
        const tag = document.createElement("div");
        tag.className = "tag";
        tag.textContent = type.toUpperCase();
        tag.style.color = "#fff";
        tag.style.border = "1px solid rgba(255, 255, 255, 0.3)";
        typesContainer.appendChild(tag);
    });

    if (typeNames.length > 1) {
        const gradient = `linear-gradient(135deg, ${typeNames.map(t => typeColors[t]).join(", ")})`;
        document.querySelectorAll("#pokemon-types .tag").forEach(tag => tag.style.background = gradient);
    } else {
        document.querySelectorAll("#pokemon-types .tag").forEach(tag => tag.style.background = typeColors[typeNames[0]]);
    }

    // Estadísticas
    const statsContainer = document.getElementById("pokemon-stats");
    statsContainer.innerHTML = "<strong>ESTADÍSTICAS:</strong><br>";
    data.stats.forEach(stat => {
        const div = document.createElement("div");
        div.className = "stat";
        const name = statNamesEs[stat.stat.name] || stat.stat.name.toUpperCase();
        div.innerHTML = `
        <span>${name}: ${stat.base_stat}</span>
        <div class="bar"><div class="bar-fill" style="width: ${Math.min(stat.base_stat, 100)}%;"></div></div>
      `;
        statsContainer.appendChild(div);
    });

    // Debilidades
    const weaknessesContainer = document.getElementById("pokemon-weaknesses");
    weaknessesContainer.innerHTML = "<strong>DEBILIDADES:</strong><br>";
    const typeUrls = data.types.map(t => t.type.url);
    const typeData = await Promise.all(typeUrls.map(url => fetch(url).then(r => r.json())));
    const relations = typeData.flatMap(t => t.damage_relations.double_damage_from);
    const weaknesses = [...new Set(relations.map(d => d.name))];
    weaknesses.forEach(w => {
        const tag = document.createElement("div");
        tag.className = "tag";
        tag.textContent = w.toUpperCase();
        tag.style.background = typeColors[w] || "#777";
        tag.style.color = "#fff";
        tag.style.border = "1px solid rgba(255, 255, 255, 0.3)";
        weaknessesContainer.appendChild(tag);
    });

    // Extra: Género y Categoría (grupo de huevo)
    const speciesRes = await fetch(data.species.url);
    const speciesData = await speciesRes.json();

    const genderRate = speciesData.gender_rate;
    const gender = genderRate === -1 ? "Género: Desconocido"
        : genderRate === 0 ? "Género: Solo macho"
            : genderRate === 8 ? "Género: Solo hembra"
                : "Género: Mixto";
    document.getElementById("pokemon-gender").textContent = gender;

    const category = speciesData.egg_groups.map(g => g.name).join(", ");
    document.getElementById("pokemon-category").textContent = `Categoría: ${category || "Desconocida"}`;
}

window.onload = getRandomPokemon;
