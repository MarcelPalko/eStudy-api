const NOTIFICATION_TEXT = Object.freeze({
  DELETE: "který jste si přidali do oblíbených byl nedávno smazán.",
  UPDATE: "který jste si přidali do oblíbecých byl upraven autorem.",
  ACTIVE:
    "který jste si přidali do oblíbecých byl autorem vrácen a je opět k dispozici.",
  RESERVED:
    "který jste si přidali do oblíbecých byl nedávno zarezervován, sledujte oznámení o stavu produktu.",
  MESSAGE: "Přišla vám nová zpráva k produktu -",
});

const createNotification = (product, type) => {
  const text =
    type !== "MESSAGE"
      ? `Produkt ${product.title}, ${NOTIFICATION_TEXT[type]}`
      : `${NOTIFICATION_TEXT[type]} ${product.title} !`;

  const newNotification = {
    text: text,
    type: type,
    createdAt: new Date().toISOString(),
    product: product._id,
  };

  return newNotification;
};

module.exports = { createNotification };
