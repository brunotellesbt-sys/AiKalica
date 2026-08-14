// Figurantes e coadjuvantes que aparecem só em diálogo (sem ficha de combate).

export const EXTRA_CAST = {
  hokage: {
    name: 'Terceiro Hokage',
    art: {
      skin: '#e2c4a2', hair: '#cfc9bd', hairStyle: 'long', eye: '#5a4a3a',
      outfit: '#d8d2c4', outfit2: '#c9452f', headband: false,
    },
  },
  iruka: {
    name: 'Iruka',
    art: {
      skin: '#d9a273', hair: '#3a2a20', hairStyle: 'ponytail', eye: '#4a3320',
      outfit: '#2b3a67', outfit2: '#4b7a4b', headband: true, bandColor: '#2b3a67', marks: 'scar',
    },
  },
  villager: {
    name: 'Aldeã',
    art: {
      skin: '#e8bd96', hair: '#5a4a3a', hairStyle: 'long', eye: '#6a5a3a',
      outfit: '#8a6a5a', outfit2: '#c9a05a', headband: false,
    },
  },
  oldMan: {
    name: 'Velho Tazu',
    art: {
      skin: '#c9a884', hair: '#b8b0a4', hairStyle: 'messy', eye: '#5a5a4a',
      outfit: '#6a6a5a', outfit2: '#3a3a2f', headband: false, marks: 'scar',
    },
  },
  merchant: {
    name: 'Mercador',
    art: {
      skin: '#d9b48c', hair: '#3a2f26', hairStyle: 'buzz', eye: '#5a4a3a',
      outfit: '#7a5a3a', outfit2: '#c9a05a', headband: false, scarf: '#8a3a2a',
    },
  },
  proctor: {
    name: 'Examinador',
    art: {
      skin: '#c9a884', hair: '#2a2a2a', hairStyle: 'swept', eye: '#4a4a58',
      outfit: '#3a3a48', outfit2: '#6a6a7a', headband: true, bandColor: '#2b3a67',
    },
  },
  anbu: {
    name: 'ANBU',
    art: {
      skin: '#d0bca8', hair: '#2a2430', hairStyle: 'swept', eye: '#4a4a58',
      outfit: '#2a2a34', outfit2: '#8a8a94', anbuMask: true,
    },
  },
  voice: {
    name: '???',
    art: null,
  },
  narrator: {
    name: '',
    art: null,
  },
};

export function extraCast(id) {
  return EXTRA_CAST[id];
}
