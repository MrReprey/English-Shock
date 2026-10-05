const gameData = {
  verbos: {
    "presente-simple": {
      title: "Verbos en forma base",

      instruction: "Escribe en inglés los siguientes verbos:",

      questions: [
        {word: "Correr", answers: ["run"],},
        {word: "Comer", answers: ["eat"],},
        {word: "Beber", answers: ["drink"],},
        {word: "Escribir", answers: ["write"],},
        {word: "Ir", answers: ["go"],},
        {word: "Hablar", answers: ["speak", "talk"],},
        {word: "Dormir", answers: ["sleep"],},
        {word: "Estudiar", answers: ["study"],},
        {word: "Jugar", answers: ["play"],},
        {word: "Caminar", answers: ["walk"],},
        {word: "Nadar", answers: ["swim"],},
        {word: "Responder", answers: ["answer"],},
        {word: "Preguntar", answers: ["ask"],},
        {word: "Amar", answers: ["love"],},
        {word: "Gustar", answers: ["like"],},
        {word: "Cerrar", answers: ["close"],},
        {word: "Tocar (Instrumentos)", answers: ["play"],},
        {word: "Ser/Estar", answers: ["be"],},
        {word: "Hacer", answers: ["do"],},
        {word: "Romper", answers: ["break"],},
        {word: "Traer", answers: ["bring"],},
        {word: "Limpiar", answers: ["clean"],},
        {word: "Comprar", answers: ["buy"],},
        {word: "Cocinar", answers: ["cook"],},
        {word: "Aprender", answers: ["learn"],},
        {word: "Saber", answers: ["know"],},
       
      ],
    },

    "pasado-simple": {
      title: "Verbos en pasado simple",

      instruction: "Escribe en inglés el pasado de los siguientes verbos:",

      questions: [
        {word: "Run", answers: ["ran"],},
        {word: "Eat", answers: ["ate"],},
        {word: "Drink", answers: ["drank"],},
        {word: "Write", answers: ["wrote"],},
        {word: "Go", answers: ["went"],},
        {word: "Speak", answers: ["spoke"],},
        {word: "Sleep", answers: ["slept"],},
        {word: "Study", answers: ["studied"],},
        {word: "Play", answers: ["played"],},
        {word: "Walk", answers: ["walked"],},
        {word: "Swim", answers: ["swam"],},
        {word: "Answer", answers: ["answered"],},
        {word: "Ask", answers: ["asked"],},
        {word: "Talk", answers: ["talked"],},
        {word: "Love", answers: ["loved"],},
        {word: "Like", answers: ["liked"],},
        {word: "Book", answers: ["booked"],},
        {word: "Get", answers: ["got"],},
        {word: "Do", answers: ["did"],},
        {word: "Be (Singular)", answers: ["was"],},
        {word: "Be (Plural)", answers: ["were"],},
        {word: "Clean", answers: ["cleaned"],},
        {word: "Buy", answers: ["bought"],},
        {word: "Cook", answers: ["cooked"],},
        {word: "Learn", answers: ["learned"],},
        {word: "Know", answers: ["knew"],},
      ],
    },
  },

  vocabulario: {
    "animales": {
      title: "Animales en ingles",

      instruction: "Escribe en inglés los siguientes animales: ",

      questions: [
        {word: "Leon", answers: ["lion"],},
        {word: "Perro", answers: ["dog"],},
        {word: "Gato", answers: ["cat"],},
        {word: "Hormiga", answers: ["ant"],},
        {word: "Mono", answers: ["monkey"],},
        {word: "Serpiente", answers: ["snake"],},
        {word: "Oso", answers: ["bear"],},
        {word: "Abeja", answers: ["bee"],},
        {word: "Caballo", answers: ["horse"],},
        {word: "Oveja", answers: ["sheep"],},
        {word: "Cerdo", answers: ["pig"],},
        {word: "Pollo", answers: ["chicken"],},
        {word: "Vaca", answers: ["cow"],},
        {word: "Cabra", answers: ["goat"],},
        {word: "Araña", answers: ["spider"],},
        {word: "Pajaro", answers: ["bird"],},
        {word: "Tortuga", answers: ["turtle"],},
        {word: "Elefante", answers: ["elephant"],},
        {word: "Raton", answers: ["mouse"],},
        {word: "Tigre", answers: ["tiger"],},
        {word: "Conejo", answers: ["rabbit"],},
        {word: "Lagarto", answers: ["aligator"],},
        {word: "Pato", answers: ["duck"],},
        {word: "Pinguino", answers: ["penguin"],},
        {word: "Pez", answers: ["fish"],},
        {word: "Lobo", answers: ["wolf"],},
      ],
    },
    
    "frutas-verduras": {
      title: "Frutas y Verduras en ingles",

      instruction: "Escribe en inglés las siguientes frutas y verduras: ",

      questions: [
        {word: "Manzana", answers: ["apple"],},
        {word: "Pera", answers: ["pear"],},
        {word: "Sandia", answers: ["watermelon"],},
        {word: "Uvas", answers: ["grapes"],},
        {word: "Lechuga", answers: ["lettuce"],},
        {word: "Tomate", answers: ["tomato"],},
        {word: "Papa", answers: ["potato"],},
        {word: "Naranja", answers: ["Orange"],},
        {word: "Rabano", answers: ["Radish"],},
        {word: "Pimenton", answers: ["pepper"],},
        {word: "Zanahoria", answers: ["carrot"],},
        {word: "Cebolla", answers: ["onion"],},
        {word: "Ajo", answers: ["garlic"],},
        {word: "Limon", answers: ["lemon"],},
        {word: "Cereza", answers: ["cherry"],},
        {word: "Fresa", answers: ["strawberry"],},
        {word: "Piña", answers: ["pineapple"],},
        {word: "Aguacate", answers: ["avocado"],},
        {word: "Coco", answers: ["coconut"],},
        {word: "Champiñon", answers: ["mushroom"],},
        {word: "Calabaza", answers: ["pumpkin"],},
        {word: "Pepinillo", answers: ["pickle"],},
        {word: "Choclo", answers: ["corn"],},
        {word: "Jengibre", answers: ["ginger"],},
        {word: "Apio", answers: ["celery"],},
        {word: "Guisante", answers: ["pea"],},
      ],
    },
  },

  oraciones: {
    "presente-simple": {
      title: "Oraciones en presente simple",

      instruction:
        "Ordena las palabras y escribe la oración correcta:",

      questions: [
        {
          word: "every / English / I / day / study",
          answers: ["I study English every day"],
        },
        {
          word: "morning / coffee / every / drinks / She",
          answers: ["She drinks coffee every morning"],
        },
        {
          word: "school / soccer / after / They / play",
          answers: ["They play soccer after school"],
        },
        {
          word: "hospital / works / a / He / in",
          answers: ["He works in a hospital"],
        },
        {
          word: "Bolivia / live / We / in",
          answers: ["We live in Bolivia"],
        },
        {
          word: "night / television / watches / at / My brother",
          answers: ["My brother watches television at night"],
        },
        {
          word: "sofa / sleeps / The cat / on / the",
          answers: ["The cat sleeps on the sofa"],
        },
        {
          word: "well / English / very / speak / You",
          answers: ["You speak English very well"],
        },
        {
          word: "week / reads / every / Maria / a book",
          answers: ["Maria reads a book every week"],
        },
        {
          word: "eight / arrives / The bus / at",
          answers: ["The bus arrives at eight"],
        },
        {
          word: "together / dinner / cook / My parents",
          answers: ["My parents cook dinner together"],
        },
        {
          word: "chocolate / like / The children",
          answers: ["The children like chocolate"],
        },
        {
          word: "Sundays / his car / washes / He / on",
          answers: ["He washes his car on Sundays"],
        },
        {
          word: "afternoon / my homework / do / I / in the",
          answers: ["I do my homework in the afternoon"],
        },
        {
          word: "clearly / explains / The teacher / the lesson",
          answers: ["The teacher explains the lesson clearly"],
        },
      ],
    },

    "pasado-simple": {
      title: "Oraciones en pasado simple",

      instruction:
        "Ordena las palabras y escribe la oración correcta:",

      questions: [
        {
          word: "yesterday / my grandmother / visited / I",
          answers: ["I visited my grandmother yesterday"],
        },
        {
          word: "last night / dinner / cooked / She",
          answers: ["She cooked dinner last night"],
        },
        {
          word: "after school / played / They / soccer",
          answers: ["They played soccer after school"],
        },
        {
          word: "on Saturday / a movie / watched / We",
          answers: ["We watched a movie on Saturday"],
        },
        {
          word: "the market / went / He / to",
          answers: ["He went to the market"],
        },
        {
          word: "the exam / studied / My brother / for",
          answers: ["My brother studied for the exam"],
        },
        {
          word: "under the table / slept / The dog",
          answers: ["The dog slept under the table"],
        },
        {
          word: "a new notebook / bought / I",
          answers: ["I bought a new notebook"],
        },
        {
          word: "a letter / wrote / Maria",
          answers: ["Maria wrote a letter"],
        },
        {
          word: "this morning / early / arrived / You",
          answers: ["You arrived early this morning"],
        },
        {
          word: "all the cake / ate / The children",
          answers: ["The children ate all the cake"],
        },
        {
          word: "to La Paz / traveled / My parents",
          answers: ["My parents traveled to La Paz"],
        },
        {
          word: "the lesson / explained / The teacher",
          answers: ["The teacher explained the lesson"],
        },
        {
          word: "a beautiful bird / saw / We",
          answers: ["We saw a beautiful bird"],
        },
        {
          word: "his bedroom / cleaned / He",
          answers: ["He cleaned his bedroom"],
        },
      ],
    },

    "presente-continuo": {
      title: "Oraciones en presente continuo",

      instruction:
        "Ordena las palabras y escribe la oración correcta:",

      questions: [
        {
          word: "a book / reading / She / is",
          answers: ["She is reading a book"],
        },
        {
          word: "soccer / are / They / playing",
          answers: ["They are playing soccer"],
        },
        {
          word: "my homework / doing / am / I",
          answers: ["I am doing my homework"],
        },
        {
          word: "English / learning / are / We",
          answers: ["We are learning English"],
        },
        {
          word: "on the sofa / sleeping / is / The dog",
          answers: ["The dog is sleeping on the sofa"],
        },
        {
          word: "dinner / cooking / My mother / is",
          answers: ["My mother is cooking dinner"],
        },
        {
          word: "television / watching / is / He",
          answers: ["He is watching television"],
        },
        {
          word: "a blue shirt / wearing / are / You",
          answers: ["You are wearing a blue shirt"],
        },
        {
          word: "in the park / running / are / The children",
          answers: ["The children are running in the park"],
        },
        {
          word: "outside / raining / is / It",
          answers: ["It is raining outside"],
        },
        {
          word: "an email / writing / is / Maria",
          answers: ["Maria is writing an email"],
        },
        {
          word: "the lesson / explaining / is / The teacher",
          answers: ["The teacher is explaining the lesson"],
        },
        {
          word: "to music / listening / am / I",
          answers: ["I am listening to music"],
        },
        {
          word: "for the bus / waiting / are / My friends",
          answers: ["My friends are waiting for the bus"],
        },
        {
          word: "milk / drinking / is / The baby",
          answers: ["The baby is drinking milk"],
        },
      ],
    },
  },
};

export default gameData;