const request = {
  message_rate_limited:
    'Sono stati inviati troppi messaggi a questo destinatario. Riprova più tardi.',
  invalid_input: "L'input non è valido. {{details}}",
  general: 'Si è verificato un errore nella richiesta.',
  range_not_satisfiable: 'Intervallo non soddisfacente.',
  feature_not_supported: "Questa funzionalità non è supportata nell'ambiente attuale.",
  rate_limited: 'Troppe richieste. Riprova più tardi.',
};

export default Object.freeze(request);
