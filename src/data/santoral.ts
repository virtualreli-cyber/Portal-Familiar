import { SaintOfDay } from '../types';

export const PRAYERS = [
  {
    id: 'rosario',
    title: 'Santo Rosario en Familia',
    category: 'Diaria',
    description: 'Oración mariana contemplando los misterios de la vida de Jesús y María.',
    text: `Misterios del día:
- Lunes y Sábado: Misterios Gozosos (La Encarnación, La Visita, El Nacimiento, La Presentación, El Niño perdido).
- Martes y Viernes: Misterios Dolorosos (La Oración en el Huerto, La Flagelación, La Coronación de espinas, El Camino del Calvario, La Crucifixión).
- Miércoles y Domingo: Misterios Gloriosos (La Resurrección, La Ascensión, La Venida del Espíritu Santo, La Asunción, La Coronación de María).
- Jueves: Misterios Luminosos (El Bautismo, Las Bodas de Caná, El Anuncio del Reino, La Transfiguración, La Eucaristía).`
  },
  {
    id: 'bendicion_mesa',
    title: 'Bendición de la Mesa',
    category: 'Comidas',
    description: 'Oración de acción de gracias antes de tomar los alimentos.',
    text: 'Bendícenos, Señor, y bendice estos alimentos que por tu bondad vamos a tomar. Bendice a quienes los han preparado y da pan a los que tienen hambre. Por Jesucristo nuestro Señor. Amén.'
  },
  {
    id: 'angelus',
    title: 'El Ángelus (12:00h)',
    category: 'Diaria',
    description: 'Oración del mediodía recordando la Encarnación del Hijo de Dios.',
    text: `V. El Ángel del Señor anunció a María.
R. Y concibió por obra del Espíritu Santo. (Avemaría)
V. He aquí la esclava del Señor.
R. Hágase en mí según tu palabra. (Avemaría)
V. Y el Verbo de Dios se hizo carne.
R. Y habitó entre nosotros. (Avemaría)
V. Ruega por nosotros, Santa Madre de Dios.
R. Para que seamos dignos de alcanzar las promesas de Nuestro Señor Jesucristo. Amén.`
  },
  {
    id: 'oracion_noche',
    title: 'Oración de la Noche en Familia',
    category: 'Noche',
    description: 'Examen de conciencia rápido y encomienda del descanso nocturno.',
    text: 'Señor Dios nuestro, al concluir este día te damos gracias por el pan, la salud y el amor en nuestra familia. Te pedimos perdón por nuestras faltas y te encomendamos nuestro descanso y el de nuestros seres queridos. Bajo tu amparo nos acogemos, Santa Madre de Dios. Amén.'
  },
  {
    id: 'consagracion_virgen',
    title: 'Consagración a la Virgen María',
    category: 'Devoción',
    description: 'Consagración de la familia al Inmaculado Corazón de María.',
    text: '¡Oh Señora mía, oh Madre mía! Yo me entrego enteramente a ti, y en prueba de mi filial afecto te me consagro en este día y para siempre, mis ojos, mis oídos, mi lengua, mi corazón; en una palabra, todo mi ser. Ya que soy todo tuyo, oh Madre de bondad, guárdame y defiéndeme como cosa y posesión tuya. Amén.'
  }
];

export const SAINTS_DATABASE: Record<string, SaintOfDay> = {
  '07-31': {
    name: 'San Ignacio de Loyola',
    title: 'Fundador de la Compañía de Jesús y Maestro Espiritual',
    bio: 'Soldado vasco convertido tras ser herido en Pamplona. Dedicó su vida a la mayor gloria de Dios ("Ad Maiorem Dei Gloriam") y redactó los Ejercicios Espirituales.',
    liturgicalColor: 'Blanco',
    season: 'Tiempo Ordinario',
    quote: 'En todo amar y servir.'
  },
  '08-01': {
    name: 'San Alfonso María de Ligorio',
    title: 'Obispo, Doctor de la Iglesia y Patrono de los Moralistas',
    bio: 'Fundador de la Congregación del Santísimo Redentor (Redentoristas), insigne teólogo moral y propagador de las Visitas al Santísimo Sacramento.',
    liturgicalColor: 'Blanco',
    season: 'Tiempo Ordinario',
    quote: 'Quien reza se salva, quien no reza se condena.'
  },
  '08-02': {
    name: 'Nuestra Señora de los Ángeles (Porciúncula)',
    title: 'Fiesta de la Porciúncula y San Eusebio de Vercelli',
    bio: 'Gran fiesta franciscana de la Indulgencia de la Porciúncula, pequeña capilla custodiada por San Francisco de Asís.',
    liturgicalColor: 'Blanco',
    season: 'Tiempo Ordinario',
    quote: 'El Señor te dé su paz.'
  },
  '08-04': {
    name: 'San Juan María Vianney (El Santo Cura de Ars)',
    title: 'Patrono de los Párrocos y Sacerdotes',
    bio: 'Párroco humilde que transformó el pueblo de Ars mediante el sacramento de la Confesión y el amor ardiente a la Eucaristía.',
    liturgicalColor: 'Blanco',
    season: 'Tiempo Ordinario',
    quote: 'La oración no es otra cosa que la unión con Dios.'
  },
  '08-15': {
    name: 'La Asunción de la Santísima Virgen María',
    title: 'Solemnidad de la Asunción en Cuerpo y Alma al Cielo',
    bio: 'Dogma de fe proclamado por Pío XII. María, preservada de todo pecado, fue elevada al cielo en cuerpo y alma al término de su vida terrena.',
    liturgicalColor: 'Blanco',
    season: 'Tiempo Ordinario',
    quote: 'Proclama mi alma la grandeza del Señor.'
  }
};

export function getTodaySaint(dateStr?: string): SaintOfDay {
  const now = dateStr ? new Date(dateStr) : new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const key = `${mm}-${dd}`;

  if (SAINTS_DATABASE[key]) {
    return SAINTS_DATABASE[key];
  }

  // Fallback for default dates
  return {
    name: 'San Ignacio de Loyola & Santoral del Día',
    title: 'Testigo de la Fe y Testimonio Cristiano',
    bio: 'Día de gracia para orar por las vocaciones, el trabajo en el hogar y la unidad familiar en la fe.',
    liturgicalColor: 'Verde',
    season: 'Tiempo Ordinario',
    quote: 'Hacedlo todo para la mayor gloria de Dios.'
  };
}
