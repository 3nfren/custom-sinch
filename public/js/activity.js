document.addEventListener("DOMContentLoaded", function () {
	// Inicializar funcionalidades
	initializeImageToggle();
	initializeVariableManagement();
});

function initializeImageToggle() {
	const hasImageCheckbox = document.getElementById("hasImage");
	const imageOptions = document.getElementById("imageOptions");

	if (hasImageCheckbox && imageOptions) {
		// Configurar evento change
		hasImageCheckbox.addEventListener("change", toggleImageOptions);
		
		// Estado inicial
		toggleImageOptions();
	}
}

function toggleImageOptions() {
	const imageOptions = document.getElementById("imageOptions");
	const hasImageCheckbox = document.getElementById("hasImage");

	if (imageOptions && hasImageCheckbox) {
		// Mostrar u ocultar las opciones de imagen según el estado del checkbox
		if (hasImageCheckbox.checked) {
			imageOptions.style.display = "block";
		} else {
			imageOptions.style.display = "none";
		}
	}
}

function initializeVariableManagement() {
	const hasVariableButton = document.getElementById("hasVariable");
	
	if (hasVariableButton) {
		hasVariableButton.addEventListener("click", addVariable);
		
		// Inicializar botones de eliminar existentes
		initializeDeleteButtons();
		
		// Estado inicial
		updateDeleteButtons();
	}
}

function addVariable() {
	let added = false;
	
	for (let i = 1; i <= 10; i++) {
		const variableDiv = document.getElementById("variable" + i);
		
		if (variableDiv && variableDiv.style.display === "none") {
			variableDiv.style.display = "block";
			added = true;
			
			// Re-inicializar el botón de eliminar para esta variable
			initializeDeleteButton(i);
			updateDeleteButtons();
			break;
		}
	}

	// Ocultar botón de agregar si ya se alcanzó el máximo
	if (document.getElementById("variable10").style.display === "block") {
		document.getElementById("hasVariable").style.display = "none";
	}
}

function initializeDeleteButtons() {
	for (let i = 1; i <= 10; i++) {
		initializeDeleteButton(i);
	}
}

function initializeDeleteButton(index) {
	const deleteBtn = document.getElementById("delete" + index);
	const variableDiv = document.getElementById("variable" + index);
	
	if (deleteBtn && variableDiv) {
		// Remover event listeners existentes y agregar uno nuevo
		deleteBtn.replaceWith(deleteBtn.cloneNode(true));
		
		document.getElementById("delete" + index).addEventListener("click", function () {
			variableDiv.style.display = "none";

			// Mostrar botón de agregar si hay menos de 10 variables visibles
			if (countVisibleVariables() < 10) {
				document.getElementById("hasVariable").style.display = "inline-block";
			}
			
			updateDeleteButtons();
		});
	}
}

function countVisibleVariables() {
	let count = 0;
	
	for (let i = 1; i <= 10; i++) {
		const div = document.getElementById("variable" + i);
		
		if (div && div.style.display !== "none") {
			count++;
		}
	}
	
	return count;
}

function updateDeleteButtons() {
	let lastVisible = null;

	for (let i = 1; i <= 10; i++) {
		const variableDiv = document.getElementById("variable" + i);
		const deleteBtn = document.getElementById("delete" + i);

		if (variableDiv && deleteBtn) {
			if (variableDiv.style.display !== "none") {
				lastVisible = deleteBtn;
				deleteBtn.style.visibility = "hidden"; // ocultar todos primero
			} else {
				deleteBtn.style.visibility = "hidden";
			}
		}
	}

	// Mostrar solo el botón de eliminar del último visible
	if (lastVisible) {
		lastVisible.style.visibility = "visible";
	}
}