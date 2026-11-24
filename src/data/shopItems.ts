import { ShopItemDef } from '../types/game';

export const SHOP_ITEMS: ShopItemDef[] = [
  {
    id: 'dragon_potion',
    name: 'Poción de Sangre de Dragón',
    description: 'Restaura +50 HP al instante durante la exploración o dentro de un Altar.',
    price: 35,
    quickKey: '1',
  },
  {
    id: 'ether_elixir',
    name: 'Elixir de Éter Arcano',
    altNameEnergy: 'Ración de Vigor Táctico',
    description: 'Restaura +50 de Maná para lanzar conjuros y consultar al Oráculo.',
    altDescriptionEnergy: 'Restaura +50 de Energía para ejecutar técnicas y consultar al Oráculo.',
    price: 30,
    quickKey: '2',
  },
  {
    id: 'oracle_scroll',
    name: 'Pergamino de Sabiduría del Oráculo',
    description: 'Desbloquea una pista del Oráculo completamente gratis, sin gastar Maná, Energía ni HP.',
    price: 45,
  },
  {
    id: 'syntax_amulet',
    name: 'Amuleto de Sintaxis',
    description: 'Activa un escudo rúnico que reduce a la mitad el daño del próximo contraataque por error de código.',
    price: 40,
    quickKey: '3',
  },
];
