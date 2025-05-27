const ThreadsHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "threads", // Nama plugin
  register: async (server, { container }) => {
    // Membuat instance ThreadsHandler dengan container yang di-inject
    const threadsHandler = new ThreadsHandler(container);
    // Mendaftarkan rute-rute yang sudah didefinisikan, dengan handler yang sudah di-instance
    server.route(routes(threadsHandler));
  },
};
