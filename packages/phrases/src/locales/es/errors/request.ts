const request = {
  message_rate_limited:
    'Se han enviado demasiados mensajes a este destinatario. Inténtalo más tarde.',
  invalid_input: 'La entrada no es válida. {{detalles}}',
  general: 'Ocurrió un error en la solicitud.',
  range_not_satisfiable: 'El rango no es satisfactorio.',
  feature_not_supported: 'Esta función no es compatible con el entorno actual.',
  rate_limited: 'Demasiadas solicitudes. Inténtalo de nuevo más tarde.',
};

export default Object.freeze(request);
