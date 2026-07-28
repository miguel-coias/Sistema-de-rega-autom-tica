// =====================================================
// Plant Monitor
// app.js
// Ficheiro único que junta a lógica do dashboard, dos
// dispositivos Bluetooth (HM-10) e das plantas.
//
// Tudo está agora numa só página (index.html) para que a
// ligação Bluetooth (BLE) se mantenha ativa quando se muda
// de secção — o navegador desliga automaticamente o GATT
// se a página for recarregada ou trocada.
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // Bluetooth - constantes e estado partilhado
    // =====================================================

    const SERVICE_UUID = "0000ffe0-0000-1000-8000-00805f9b34fb";
    const CHARACTERISTIC_UUID = "0000ffe1-0000-1000-8000-00805f9b34fb";

    let bluetoothDevice = null;
    let bluetoothCharacteristic = null;

    // O HM-10 costuma dividir mensagens BLE em vários pacotes pequenos
    // (~20 bytes). Este buffer junta os pedaços até termos uma linha
    // completa (terminada em "\n") antes de a interpretarmos.
    let bleBuffer = "";

    // =====================================================
    // Estado partilhado de dados
    // =====================================================

    let plants = [];
    let devices = [];
    let editingPlantId = null;

    // =====================================================
    // Elementos - Logout
    // =====================================================

    const logoutBtn = document.getElementById("logoutBtn");
    const usernameEl = document.getElementById("username");

    if (usernameEl) {
        const savedName = localStorage.getItem("plantMonitorUserName");
        if (savedName) {
            usernameEl.textContent = "Olá, " + savedName;
        }
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("plantMonitorUserName");
            window.location.href = "php/logout.php";
        });
    }

    // =====================================================
    // Elementos - Modais
    // =====================================================

    const plantModal = document.getElementById("plantModal");
    const editPlantModal = document.getElementById("editPlantModal");
    const detailsModal = document.getElementById("detailsModal");
    const deviceModal = document.getElementById("deviceModal");
    const pairModal = document.getElementById("pairModal");
    const deviceDetailsModal = document.getElementById("deviceDetailsModal");

    const allModals = [
        plantModal,
        editPlantModal,
        detailsModal,
        deviceModal,
        pairModal,
        deviceDetailsModal
    ];

    function closeModals() {
        allModals.forEach(modal => {
            if (modal) modal.style.display = "none";
        });
    }

    document.querySelectorAll(".close").forEach(button => {
        button.addEventListener("click", closeModals);
    });

    window.addEventListener("click", event => {
        if (allModals.includes(event.target)) {
            closeModals();
        }
    });

    // =====================================================
    // Elementos - Dashboard
    // =====================================================

    const addPlantBtn = document.getElementById("addPlantBtn");
    const pairDeviceBtn = document.getElementById("pairDeviceBtn");
    const deviceContainer = document.getElementById("deviceContainer");
    const plantsContainer = document.getElementById("plantsContainer");

    const totalPlants = document.getElementById("totalPlants");
    const totalDevices = document.getElementById("totalDevices");
    const alertsEl = document.getElementById("alerts");
    const averageHumidity = document.getElementById("averageHumidity");

    // =====================================================
    // Elementos - Dispositivos
    // =====================================================

    const pairBluetoothBtn = document.getElementById("pairBluetooth");
    const refreshDevicesBtn = document.getElementById("refreshDevices");
    const bluetoothStatus = document.getElementById("bluetoothStatus");
    const connectionStatus = document.getElementById("connectionStatus");
    const deviceContainerPage = document.getElementById("deviceContainerPage");

    const connectBluetoothBtn = document.getElementById("connectBluetooth");
    const searchBluetoothBtn = document.getElementById("searchBluetooth");

    // =====================================================
    // Elementos - Plantas
    // =====================================================

    const addPlantBtnPage = document.getElementById("addPlantBtnPage");
    const refreshPlantsBtn = document.getElementById("refreshPlants");
    const plantsContainerPage = document.getElementById("plantsContainerPage");

    const plantForm = document.getElementById("plantForm");
    const editPlantForm = document.getElementById("editPlantForm");
    const plantDetails = document.getElementById("plantDetails");

    // =====================================================
    // Abrir modais
    // =====================================================

    if (addPlantBtn && plantModal) {
        addPlantBtn.addEventListener("click", () => {
            plantModal.style.display = "flex";
        });
    }

    if (addPlantBtnPage && plantModal) {
        addPlantBtnPage.addEventListener("click", () => {
            plantModal.style.display = "flex";
        });
    }

    if (pairDeviceBtn && deviceModal) {
        pairDeviceBtn.addEventListener("click", () => {
            deviceModal.style.display = "flex";
        });
    }

    // =====================================================
    // Emparelhar HM-10 (todos os botões chamam a MESMA função)
    // =====================================================

    if (pairBluetoothBtn) {
        pairBluetoothBtn.addEventListener("click", connectBluetooth);
    }

    if (connectBluetoothBtn) {
        connectBluetoothBtn.addEventListener("click", connectBluetooth);
    }

    if (searchBluetoothBtn) {
        searchBluetoothBtn.addEventListener("click", connectBluetooth);
    }

    if (refreshDevicesBtn) {
        refreshDevicesBtn.addEventListener("click", loadDevices);
    }

    if (refreshPlantsBtn) {
        refreshPlantsBtn.addEventListener("click", loadPlants);
    }

    // =====================================================
    // Atualizar texto de estado da ligação (nas duas vistas)
    // =====================================================

    function updateStatus(text) {
        if (bluetoothStatus) bluetoothStatus.textContent = text;
        if (connectionStatus) connectionStatus.textContent = text;
    }

    // =====================================================
    // Ligar ao HM-10
    // =====================================================

    let connectedDeviceId = null;

    async function connectBluetooth() {

        if (!navigator.bluetooth) {
            alert("Este navegador não suporta Web Bluetooth.\n\nUtiliza Google Chrome ou Microsoft Edge.");
            return;
        }

        try {

            updateStatus("À procura do HM-10...");

            bluetoothDevice = await navigator.bluetooth.requestDevice({
                filters: [{ namePrefix: "HM" }],
                optionalServices: [SERVICE_UUID]
            });

            bluetoothDevice.addEventListener("gattserverdisconnected", () => {
                updateStatus("HM-10 desligado");
                connectedDeviceId = null;
                renderDevices(deviceContainer);
                renderDevices(deviceContainerPage);
            });

            const server = await bluetoothDevice.gatt.connect();
            const service = await server.getPrimaryService(SERVICE_UUID);
            bluetoothCharacteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

            updateStatus("Ligado ao " + getFriendlyDeviceName(bluetoothDevice));

            await saveDevice(bluetoothDevice);
            await loadDevices();

            // Identificar, na lista de dispositivos da BD, a que dispositivo
            // ligado corresponde este bluetoothDevice.id, para sabermos a
            // que planta associar as leituras de humidade.
            const matchedDevice = devices.find(d => String(d.bluetooth_id) === String(bluetoothDevice.id));
            connectedDeviceId = matchedDevice ? matchedDevice.id : null;

            renderDevices(deviceContainer);
            renderDevices(deviceContainerPage);

            closeModals();

        }
        catch (error) {
            console.error("Erro ao ligar ao HM-10:", error);
            updateStatus("Ligação cancelada");
            return;
        }

        // Iniciar notificações num bloco separado: se isto falhar, a ligação
        // BLE em si continua ativa, e queremos ver o erro claramente em vez
        // de apagar silenciosamente o estado "Ligado".
        try {
            await startNotifications();
        }
        catch (error) {
            console.error("Erro ao iniciar notificações BLE:", error);
            alert("Ligado ao HM-10, mas não foi possível iniciar a receção de dados: " + error.message);
        }

    }

    // =====================================================
    // Guardar dispositivo
    // =====================================================

    // Muitos módulos HM-10 (sobretudo clones genéricos) não emitem um
    // nome amigável — emitem o próprio endereço/ID Bluetooth como se
    // fosse o nome. Esta função deteta esse caso e usa "HM-10" em vez
    // de mostrar um endereço ilegível ao utilizador.
    function getFriendlyDeviceName(device) {

        const name = (device.name || "").trim();

        // Formatos típicos de endereço: "AA:BB:CC:DD:EE:FF" ou uma
        // sequência longa em hexadecimal sem separadores.
        const pareceEndereco =
            /^([0-9A-Fa-f]{2}[:-]){3,}[0-9A-Fa-f]{2}$/.test(name) ||
            /^[0-9A-Fa-f]{8,}$/.test(name);

        if (!name || pareceEndereco) {
            return "HM-10";
        }

        return name;
    }

    async function saveDevice(device) {

        try {

            const formData = new FormData();
            formData.append("device_name", getFriendlyDeviceName(device));
            formData.append("bluetooth_id", device.id || device.name);

            const response = await fetch("php/pairDevice.php", {
                method: "POST",
                body: formData,
                credentials: "same-origin"
            });

            const result = await response.json();
            console.log(result);

            if (!result.success) {
                alert("Não foi possível guardar o dispositivo: " + result.message);
            }

        }
        catch (error) {
            console.error(error);
        }

    }

    // =====================================================
    // Carregar dispositivos (renderiza nas duas vistas)
    // =====================================================

    async function loadDevices() {

        try {

            const response = await fetch("php/getDevices.php", {
                credentials: "same-origin"
            });

            const result = await response.json();

            if (!result.success) {
                console.warn("getDevices falhou:", result.message);
            }

            devices = (result.success && result.data) ? result.data : [];

            renderDevices(deviceContainer);
            renderDevices(deviceContainerPage);
            populateDeviceSelects();
            updateDashboard();

        }
        catch (error) {
            console.error(error);
        }

    }

    function renderDevices(container) {

        if (!container) return;

        container.innerHTML = "";

        if (devices.length === 0) {
            container.innerHTML = `
                <p style="text-align:center;padding:20px;">
                    Nenhum dispositivo HM-10 associado.
                </p>
            `;
            return;
        }

        devices.forEach(device => {

            const card = document.createElement("div");
            card.className = "device-card";
            card.dataset.id = device.id ?? "";

            const isConnected = connectedDeviceId !== null && String(device.id) === String(connectedDeviceId);
            const statusText = isConnected ? "Ligado" : "Não ligado";
            const statusClass = isConnected ? "connected" : "disconnected";

            card.innerHTML = `
                <h3>${device.device_name}</h3>
                <p><strong>Tipo:</strong> Módulo Bluetooth LE (HM-10)</p>
                <p>
                    <strong>Estado:</strong>
                    <span class="${statusClass}">${statusText}</span>
                </p>
                <div class="device-buttons">
                    <button class="detailsBtn">
                        <i class="fa-solid fa-circle-info"></i>
                        Detalhes
                    </button>
                </div>
            `;

            container.appendChild(card);

        });

    }

    function attachDeviceDetailsHandler(container) {

        if (!container) return;

        container.addEventListener("click", event => {

            const card = event.target.closest(".device-card");
            if (!card) return;

            if (!event.target.classList.contains("detailsBtn")) return;

            const id = card.dataset.id;
            const device = devices.find(d => String(d.id) === String(id));

            showDeviceDetails(device, card);

        });

    }

    attachDeviceDetailsHandler(deviceContainer);
    attachDeviceDetailsHandler(deviceContainerPage);

    function showDeviceDetails(device, card) {

        const deviceDetails = document.getElementById("deviceDetails");

        if (!device) return;

        if (deviceDetails) {

            const isConnected = connectedDeviceId !== null && String(device.id) === String(connectedDeviceId);

            deviceDetails.innerHTML = `
                <p><strong>Nome:</strong> ${device.device_name || "-"}</p>
                <p><strong>Endereço Bluetooth:</strong> ${device.bluetooth_id || "-"}</p>
                <p><strong>Estado:</strong> ${isConnected ? "Ligado" : "Não ligado"}</p>
                <p><strong>Data de Associação:</strong> ${device.created_at || device.paired_at || "-"}</p>
                <p><strong>Número de Plantas:</strong> ${plants.filter(p => String(p.device_id) === String(device.id)).length}</p>
            `;
        }

        if (deviceDetailsModal) {
            deviceDetailsModal.style.display = "flex";
        }

    }

    // =====================================================
    // Preencher os <select> de dispositivo nos formulários
    // =====================================================

    function populateDeviceSelects() {

        const addSelect = document.getElementById("deviceSelect");
        const editSelect = document.getElementById("editDevice");

        // No formulário de ADICIONAR planta, não mostrar dispositivos
        // que já estão associados a outra planta.
        if (addSelect) {

            const currentValue = addSelect.value;
            const usedDeviceIds = new Set(plants.map(p => String(p.device_id)).filter(id => id && id !== "null"));
            const availableDevices = devices.filter(d => !usedDeviceIds.has(String(d.id)));

            if (availableDevices.length === 0) {
                addSelect.innerHTML = `<option value="">Nenhum dispositivo disponível</option>`;
            } else {
                addSelect.innerHTML = availableDevices.map(device =>
                    `<option value="${device.id}">${device.device_name}</option>`
                ).join("");
            }

            if (currentValue) {
                addSelect.value = currentValue;
            }

        }

        // No formulário de EDITAR planta, mostrar todos os dispositivos
        // livres MAIS o dispositivo que já está associado a esta planta
        // (senão desapareceria da lista ao editar).
        if (editSelect) {

            const currentValue = editSelect.value;
            const usedDeviceIds = new Set(
                plants
                    .filter(p => Number(p.id) !== Number(editingPlantId))
                    .map(p => String(p.device_id))
                    .filter(id => id && id !== "null")
            );
            const availableDevices = devices.filter(d => !usedDeviceIds.has(String(d.id)));

            if (availableDevices.length === 0) {
                editSelect.innerHTML = `<option value="">Nenhum dispositivo disponível</option>`;
            } else {
                editSelect.innerHTML = availableDevices.map(device =>
                    `<option value="${device.id}">${device.device_name}</option>`
                ).join("");
            }

            if (currentValue) {
                editSelect.value = currentValue;
            }

        }

    }

    // =====================================================
    // Receber dados BLE (humidade)
    // =====================================================

    async function startNotifications() {

        if (!bluetoothCharacteristic) return;

        await bluetoothCharacteristic.startNotifications();

        bluetoothCharacteristic.addEventListener(
            "characteristicvaluechanged",
            receiveData
        );

        console.log("À espera dos dados...");

    }

    async function receiveData(event) {

        const decoder = new TextDecoder();
        const chunk = decoder.decode(event.target.value);

        bleBuffer += chunk;

        // O HM-10 pode entregar a mensagem em vários pacotes BLE
        // separados. Só tratamos uma leitura como válida quando
        // encontramos uma linha completa (terminada em "\n") no buffer;
        // fragmentos incompletos ficam guardados à espera do resto.
        let newlineIndex;

        while ((newlineIndex = bleBuffer.indexOf("\n")) !== -1) {

            const line = bleBuffer.slice(0, newlineIndex).trim();
            bleBuffer = bleBuffer.slice(newlineIndex + 1);

            if (line.length === 0) continue;

            console.log("Linha BLE completa recebida:", JSON.stringify(line));

            const match = line.match(/-?\d+/);

            if (!match) {
                console.warn("Não foi possível extrair um valor numérico de:", line);
                continue;
            }

            const humidity = Math.max(0, Math.min(100, parseInt(match[0], 10)));

            console.log("Humidade interpretada:", humidity);

            await saveHumidity(humidity);

        }

    }

    async function saveHumidity(humidity) {

        try {

            if (plants.length === 0) {
                console.warn("Recebida humidade mas não existem plantas registadas.");
                return;
            }

            // Preferir a planta associada ao dispositivo Bluetooth que está
            // ligado agora. Se não conseguirmos identificar essa planta
            // (ex.: dispositivo ainda sem planta associada), usa a primeira
            // planta como recurso, para não perder a leitura.
            let targetPlant = null;

            if (connectedDeviceId) {
                targetPlant = plants.find(p => String(p.device_id) === String(connectedDeviceId));
            }

            if (!targetPlant) {
                targetPlant = plants[0];
            }

            const formData = new FormData();
            formData.append("plant_id", targetPlant.id);
            formData.append("humidity", humidity);

            const response = await fetch("php/updateHumidity.php", {
                method: "POST",
                body: formData,
                credentials: "same-origin"
            });

            const result = await response.json();

            if (!result.success) {
                console.warn("updateHumidity falhou:", result.message);
                return;
            }

            await loadPlants();

        }
        catch (error) {
            console.error(error);
        }

    }

    // =====================================================
    // Adicionar planta
    // =====================================================

    if (plantForm) {

        plantForm.addEventListener("submit", async event => {

            event.preventDefault();

            const name = document.getElementById("plantName").value.trim();
            const type = document.getElementById("plantType").value;
            const deviceId = Number(document.getElementById("deviceSelect")?.value || 0);

            if (!name || !type) {
                alert("Preenche todos os campos.");
                return;
            }

            try {

                const response = await fetch("php/addPlant.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "same-origin",
                    body: JSON.stringify({
                        name: name,
                        type_name: type,
                        device_id: deviceId
                    })
                });

                const result = await response.json();
                alert(result.message);

                if (result.success) {
                    plantForm.reset();
                    closeModals();
                    await loadPlants();
                }

            }
            catch (error) {
                console.error(error);
                alert("Erro ao guardar planta.");
            }

        });

    }

    // =====================================================
    // Editar planta
    // =====================================================

    if (editPlantForm) {

        editPlantForm.addEventListener("submit", async event => {

            event.preventDefault();

            const name = document.getElementById("editPlantName").value.trim();
            const type = document.getElementById("editPlantType").value;
            const deviceId = Number(document.getElementById("editDevice")?.value || 0);

            if (!editingPlantId || !name || !type) {
                alert("Dados inválidos.");
                return;
            }

            try {

                const response = await fetch("php/updatePlant.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "same-origin",
                    body: JSON.stringify({
                        id: editingPlantId,
                        name: name,
                        type_name: type,
                        device_id: deviceId
                    })
                });

                const result = await response.json();
                alert(result.message);

                if (result.success) {
                    closeModals();
                    await loadPlants();
                }

            }
            catch (error) {
                console.error(error);
                alert("Erro ao atualizar planta.");
            }

        });

    }

    // =====================================================
    // Carregar plantas (renderiza nas duas vistas)
    // =====================================================

    async function loadPlants() {

        try {

            const response = await fetch("php/getPlants.php", {
                credentials: "same-origin"
            });

            const result = await response.json();

            if (!result.success) {
                if (plantsContainer) plantsContainer.innerHTML = `<p>${result.message}</p>`;
                if (plantsContainerPage) plantsContainerPage.innerHTML = `<p>${result.message}</p>`;
                return;
            }

            plants = result.data || [];

            renderPlants(plantsContainer, false);
            renderPlants(plantsContainerPage, true);
            populateDeviceSelects();
            updateDashboard();

        }
        catch (error) {
            console.error(error);
            if (plantsContainer) plantsContainer.innerHTML = "<p>Erro ao carregar plantas.</p>";
            if (plantsContainerPage) plantsContainerPage.innerHTML = "<p>Erro ao carregar plantas.</p>";
        }

    }

    function renderPlants(container, withActions) {

        if (!container) return;

        container.innerHTML = "";

        if (plants.length === 0) {
            container.innerHTML = `
                <p style="text-align:center;padding:30px;">
                    Ainda não existem plantas registadas.
                </p>
            `;
            return;
        }

        plants.forEach(plant => {

            const humidity = Number(plant.humidity ?? 0);

            let status = "Humidade ideal";
            let statusClass = "ok";

            if (humidity < 40) {
                status = "Regar planta";
                statusClass = "warning";
            }
            else if (humidity > 80) {
                status = "Humidade elevada";
                statusClass = "danger";
            }

            const card = document.createElement("div");
            card.className = "plant-card";
            card.dataset.id = plant.id;

            card.innerHTML = `
                <h3>${plant.name}</h3>
                <p><strong>Tipo:</strong> ${plant.type || "Outra"}</p>
                <p><strong>Dispositivo:</strong> ${plant.device_name || "Sem dispositivo"}</p>
                <h2>${humidity}%</h2>
                <div class="progress">
                    <div class="progress-bar" style="width:${humidity}%"></div>
                </div>
                <p class="status ${statusClass}">${status}</p>
                ${withActions ? `
                <div class="plant-buttons">
                    <button class="detailsBtn">Detalhes</button>
                    <button class="editBtn">Editar</button>
                    <button class="deleteBtn">Eliminar</button>
                </div>` : `
                <div class="plant-buttons">
                    <button class="detailsBtn">Detalhes</button>
                </div>`}
            `;

            container.appendChild(card);

        });

    }

    function attachPlantActionsHandler(container) {

        if (!container) return;

        container.addEventListener("click", async event => {

            const card = event.target.closest(".plant-card");
            if (!card) return;

            const id = Number(card.dataset.id);
            const plant = plants.find(p => Number(p.id) === id);
            if (!plant) return;

            if (event.target.classList.contains("detailsBtn")) {
                showPlantDetails(plant);
            }

            if (event.target.classList.contains("editBtn")) {
                openEditModal(plant);
            }

            if (event.target.classList.contains("deleteBtn")) {
                await deletePlant(plant.id);
            }

        });

    }

    attachPlantActionsHandler(plantsContainer);
    attachPlantActionsHandler(plantsContainerPage);

    function showPlantDetails(plant) {

        const humidity = Number(plant.humidity || 0);

        if (plantDetails) {
            plantDetails.innerHTML = `
                <p><strong>Nome:</strong> ${plant.name}</p>
                <p><strong>Tipo:</strong> ${plant.type || "Outra"}</p>
                <p><strong>Dispositivo:</strong> ${plant.device_name || "Sem dispositivo"}</p>
                <p><strong>Humidade Atual:</strong> ${humidity}%</p>
                <p><strong>Estado:</strong> ${humidity < 40 ? "Regar planta" : (humidity > 80 ? "Humidade elevada" : "Humidade ideal")}</p>
                <p><strong>Última Atualização:</strong> ${plant.last_watered || plant.updated_at || "Sem registo"}</p>
            `;
        }

        if (detailsModal) {
            detailsModal.style.display = "flex";
        }

    }

    function openEditModal(plant) {

        editingPlantId = Number(plant.id);

        const editName = document.getElementById("editPlantName");
        const editType = document.getElementById("editPlantType");
        const editDevice = document.getElementById("editDevice");

        if (editName) editName.value = plant.name || "";
        if (editType) editType.value = plant.type || "Outra";
        if (editDevice && plant.device_id) editDevice.value = plant.device_id;

        if (editPlantModal) {
            editPlantModal.style.display = "flex";
        }

    }

    async function deletePlant(id) {

        if (!confirm("Pretendes eliminar esta planta?")) return;

        try {

            const formData = new FormData();
            formData.append("id", id);

            const response = await fetch("php/deletePlant.php", {
                method: "POST",
                body: formData,
                credentials: "same-origin"
            });

            const result = await response.json();
            alert(result.message);

            if (result.success) await loadPlants();

        }
        catch (error) {
            console.error(error);
            alert("Erro ao eliminar planta.");
        }

    }

    // =====================================================
    // Atualizar cartões do Dashboard
    // =====================================================

    function updateDashboard() {

        if (totalPlants) totalPlants.textContent = plants.length;

        if (totalDevices) totalDevices.textContent = devices.length;

        if (alertsEl) {

            let counter = 0;

            plants.forEach(plant => {
                const humidity = Number(plant.humidity ?? 0);
                if (humidity < 40 || humidity > 80) counter++;
            });

            alertsEl.textContent = counter;

        }

        if (averageHumidity) {

            if (plants.length === 0) {
                averageHumidity.textContent = "0%";
            }
            else {
                let total = 0;
                plants.forEach(plant => {
                    total += Number(plant.humidity ?? 0);
                });
                averageHumidity.textContent = Math.round(total / plants.length) + "%";
            }

        }

    }

    // =====================================================
    // Inicialização
    // =====================================================

    updateStatus("Não ligado");
    loadDevices();
    loadPlants();

});