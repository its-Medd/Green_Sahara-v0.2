const { SerialPort } = require('serialport');

async function listPorts() {
  console.log("Recherche des ports série disponibles...");
  try {
    const ports = await SerialPort.list();
    if (ports.length === 0) {
      console.log("AUCUN périphérique détecté. Vérifiez le câble USB.");
    } else {
      console.log(" Périphériques trouvés :");
      ports.forEach(port => {
        console.log(`- PORT: ${port.path} | DESCRIPTION: ${port.friendlyName || 'Inconnu'}`);
      });
    }
  } catch (err) {
    console.error("Erreur lors de la détection :", err.message);
  }
}

listPorts();
