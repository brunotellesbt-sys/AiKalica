# Kalica no Sato — Crônicas do Ninja

RPG de turnos com estrutura de **visual novel** e **escolhas que ramificam a história**, ambientado no universo ninja — inspirado no ritmo de combate de *Path of the Ninja* (Nintendo DS).

Roda direto no navegador. **Sem dependências e sem assets de terceiros**: a arte é SVG gerado por código (e gravado em `assets/`, para poder ser substituída à mão) e o áudio é sintetizado via WebAudio em tempo real.

```bash
npm run build:assets   # gera a arte em assets/ (já versionada; só é preciso após mexer em src/art/)
npm start      # serve em http://localhost:8080
npm test       # 42 testes de dados, roteiro, arte e balanceamento
```

> Precisa ser servido por HTTP (o jogo usa ES modules). Abrir o `index.html` direto do disco não funciona.

## Publicar no GitHub Pages

O workflow `.github/workflows/deploy-pages.yml` roda os testes em todo push e publica o site quando o commit chega ao `main`.

O passo `configure-pages` usa `enablement: true`, então tenta habilitar o Pages sozinho no primeiro deploy. Se a permissão do token não for suficiente, o job falha em *"Get Pages site failed"* — nesse caso basta ajustar uma vez na mão:

**Settings → Pages → Build and deployment → Source: `GitHub Actions`**

O site fica em `https://<usuário>.github.io/AiKalica/`. Como o jogo é estático e usa só caminhos relativos, funciona no subdiretório sem nenhum ajuste de base path.

---

## O que está implementado

### Visual novel
- Interpretador de cenas próprio com DSL declarativa (`src/data/story/dsl.js`).
- Retratos com 9 expressões faciais, cenários que trocam com fade, efeito de máquina de escrever, histórico de diálogo rolável.
- Cartões de capítulo, narração, elenco em cena com destaque de quem fala.

### Escolhas que importam
Decisões alimentam quatro eixos que se combinam no desfecho:

| Eixo | Efeito |
|---|---|
| **Flags** | Destravam cenas, diálogos e opções exclusivas |
| **Elos** (0–100 por personagem) | Mudam falas, liberam jutsus combinados e pesam no final |
| **Karma** (Sombra ↔ Vontade de Fogo) | Muda como os personagens te tratam e quais rotas abrem |
| **Recrutamento** | Kaede e Jin só entram no time por caminhos específicos |

Escolhas com consequência real, não cosmética: salvar as famílias **ou** a ponte (as duas coisas não cabem), poupar **ou** executar Karasu, ir às ruínas **ou** fortificar a vila (essa decide se um capítulo inteiro acontece), e quatro formas de encerrar o confronto final.

**5 finais**, incluindo um verdadeiro que exige entender o selo *e* ter elos fortes. Ficam registrados numa galeria persistente entre partidas.

### Combate por turnos
- Ordem por velocidade com jitter; chefes agem 2× por rodada (o boss final, 3×).
- **Cadeia elemental**: Fogo ▸ Vento ▸ Raio ▸ Terra ▸ Água ▸ Fogo (×1,5 a favor / ×0,65 contra).
- **Formação** frente/retaguarda alterando dano físico dado e recebido.
- **21 status** com interações — `Encharcado` amplifica Raio, `Substituição` anula um golpe inteiro, `Estático` reflete dano, `Provocação` redireciona ataques.
- **Vontade de Fogo**: barra compartilhada que enche apanhando e revidando; cheia, libera **jutsus combinados** que dependem de quem está vivo no time.
- Passivas por personagem (Sharingan, chakra médico, muralha do Jin), 5 tipos de IA inimiga, itens de combate, fuga, crítico, multi-golpe e perfuração de defesa.

### Mapa andável
Entre capítulos você **anda por Konoha** em 2D, visão de cima, em vez de escolher itens numa lista.

- **Sprites de caminhada** em 4 direções × 3 quadros, gerados para cada personagem a partir dos mesmos parâmetros visuais dos retratos — cada um anda com o próprio cabelo, roupa e bandana.
- O time **segue você em fila**, cada membro alguns passos atrás.
- Colisão com árvores, prédios, cerca e rio; câmera presa nos limites do mapa.
- Pontos de interesse marcados com ícone: quadro de missões, loja, Ichiraku (descanso), campo de treino, pedra memorial e o portão (seguir a história).
- Companheiros com conversa disponível ganham um balão 💬 sobre a cabeça, então não é preciso adivinhar com quem dá para falar.
- Controles: **WASD/setas** e **Enter**, ou d-pad e botão na tela para toque.

### Arte em `assets/`
Toda a arte é desenhada por código, mas o jogo **não** a gera em tempo real: `npm run build:assets` escreve 451 arquivos SVG em `assets/`, e é de lá que o jogo carrega.

Isso existe para que a arte seja substituível. Quer trocar o retrato bravo do Naruto por um desenho seu? Sobrescreva `assets/characters/naruto/portrait/angry.svg`. O jogo passa a mostrar o seu, sem mexer numa linha de código.

    assets/characters/<id>/portrait/<emoção>.svg   busto da visual novel
    assets/characters/<id>/walk/<direção>-<n>.svg  caminhada do mapa
    assets/characters/<id>/battle.svg              sprite de combate
    assets/cast/<id>/…                             figurantes que só falam
    assets/enemies/<id>/…                          inimigos
    assets/backgrounds/<id>.svg                    cenários

Se um arquivo faltar ou falhar ao carregar, o jogo desenha o procedural equivalente e segue rodando — nunca quebra por causa de arte ausente. O protagonista tem uma pasta por afinidade elemental, porque a cor da roupa acompanha o elemento.

### Intervalo (conteúdo opcional)
Entre capítulos o jogo abre um **Intervalo**, que existe para resolver um problema concreto: sem ele, quem chega mal preparado num chefe só pode repetir a mesma luta no mesmo nível.

- **12 missões livres** em rank D/C/B, liberadas conforme a história avança. Repetíveis para treinar e juntar ryo; a primeira conclusão dá recompensa extra.
- **12 cenas de elo** — conversas opcionais destravadas por nível de elo, duas por companheiro. É onde o sistema de elos ganha pagamento narrativo, e não só numérico.
- Loja, descanso e acesso ao menu no mesmo lugar.

Perder uma missão nunca trava o jogo: por ser conteúdo opcional, o time volta de pé.

### Progressão
- 7 personagens jogáveis, 51 jutsus, 40 níveis, jutsus aprendidos por nível.
- Protagonista customizável: nome, **afinidade elemental** (muda a lista de jutsus) e **estilo de luta** (muda a curva de atributos). São escolhas de build reais, não sabor.
- Equipamento em 3 slots, loja com estoque que cresce por capítulo, 20 itens.
- 3 slots de save + autosave, tudo em `localStorage`.

---

## Estrutura

```
index.html
styles/          base · vn · battle · menu · overworld
src/
  main.js              alterna título ↔ história
  core/                estado, RNG determinístico, save, áudio, helpers de DOM
  art/                 retratos, sprites de combate, caminhada, cenários + carregador de assets
  data/                personagens, jutsus, itens, inimigos, missões, mapas
  data/story/          DSL + prólogo, capítulos 1-4, finale, finais, cenas de elo
  systems/             batalha, efeitos de status, progressão
  screens/             título, visual novel, batalha, menu, mapa, final
assets/              451 SVGs gerados (versionados)
tools/build-assets.mjs
tests/smoke.test.mjs
```

Separação deliberada: `systems/` é lógica pura e testável sem navegador — é por isso que o balanceamento pode ser simulado em Node. `screens/` só desenha e coleta input.

---

## Testes

`npm test` roda sem navegador e cobre:

- **Integridade de dados** — todo jutsu, item, status, drop e inimigo referenciado existe de fato.
- **Integridade do roteiro** — todo `go`/`goto` aponta para cena existente, nenhuma cena órfã, todos os 5 finais alcançáveis, todo capítulo abrindo um Intervalo.
- **Conteúdo opcional** — missões e cenas de elo referenciando só inimigos/itens/personagens que existem, elos destravando em ordem crescente e cada conversa rodando uma única vez.
- **Arte em disco** — cruza o roteiro com `assets/`: toda expressão usada em diálogo, todo figurante que fala, todo cenário citado e as URLs exatas que o carregador monta têm que existir como arquivo.
- **Progressão** — estilo altera atributos na direção certa, EXP sobe nível e ensina jutsu, elos e karma saturam corretamente.
- **Balanceamento por simulação** — batalhas simuladas com IA nos dois lados, verificando que times de nível adequado vencem ≥70% dos encontros comuns e que chefes não são vitória garantida.

Foi essa última categoria que pegou o problema real durante o desenvolvimento: chefes morriam em 3-4 rodadas com o time a 80% de HP. O HP dos chefes foi recalibrado e eles ganharam ação dupla por rodada — agora as lutas duram 6-10 rodadas e terminam com o time entre 25% e 60%.

---

## Atalhos

| Tecla | Ação |
|---|---|
| `Espaço` / `Enter` / clique | Avançar diálogo (clicar de novo pula a digitação) |
| `WASD` / setas | Andar pelo mapa |
| `Enter` / `E` | Interagir no mapa |
| `M` | Menu |
| `L` | Histórico de diálogo |
| `Esc` | Fechar janela |

---

## Nota

Fangame não-comercial, feito por diversão. A história, os personagens originais (Kaede, Jin, Kagemasa), o sistema de combate, a arte e o áudio são originais deste projeto — nenhum asset de terceiros é usado ou distribuído. Naruto é propriedade de Masashi Kishimoto e da Shueisha.
