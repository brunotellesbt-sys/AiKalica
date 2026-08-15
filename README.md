# Kalica no Sato — Crônicas do Ninja

RPG de turnos com estrutura de **visual novel** e **escolhas que ramificam a história**, ambientado no universo ninja — inspirado no ritmo de combate de *Path of the Ninja* (Nintendo DS).

Roda direto no navegador. **Sem build, sem dependências, sem assets externos**: toda a arte é SVG gerado proceduralmente e todo o áudio é sintetizado via WebAudio em tempo real.

```bash
npm start      # serve em http://localhost:8080
npm test       # 27 testes de dados, roteiro e balanceamento
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

### Progressão
- 7 personagens jogáveis, 51 jutsus, 40 níveis, jutsus aprendidos por nível.
- Protagonista customizável: nome, **afinidade elemental** (muda a lista de jutsus) e **estilo de luta** (muda a curva de atributos). São escolhas de build reais, não sabor.
- Equipamento em 3 slots, loja com estoque que cresce por capítulo, 20 itens.
- 3 slots de save + autosave, tudo em `localStorage`.

---

## Estrutura

```
index.html
styles/          base · vn · battle · menu
src/
  main.js              alterna título ↔ história
  core/                estado, RNG determinístico, save, áudio, helpers de DOM
  art/                 retratos, sprites e cenários gerados em SVG
  data/                personagens, jutsus, itens, inimigos
  data/story/          DSL + prólogo, capítulos 1-4, finale, finais
  systems/             batalha, efeitos de status, progressão
  screens/             título, visual novel, batalha, menu, final
tests/smoke.test.mjs
```

Separação deliberada: `systems/` é lógica pura e testável sem navegador — é por isso que o balanceamento pode ser simulado em Node. `screens/` só desenha e coleta input.

---

## Testes

`npm test` roda sem navegador e cobre:

- **Integridade de dados** — todo jutsu, item, status, drop e inimigo referenciado existe de fato.
- **Integridade do roteiro** — todo `go`/`goto` aponta para cena existente, nenhuma cena órfã, todos os 5 finais alcançáveis.
- **Progressão** — estilo altera atributos na direção certa, EXP sobe nível e ensina jutsu, elos e karma saturam corretamente.
- **Balanceamento por simulação** — batalhas simuladas com IA nos dois lados, verificando que times de nível adequado vencem ≥70% dos encontros comuns e que chefes não são vitória garantida.

Foi essa última categoria que pegou o problema real durante o desenvolvimento: chefes morriam em 3-4 rodadas com o time a 80% de HP. O HP dos chefes foi recalibrado e eles ganharam ação dupla por rodada — agora as lutas duram 6-10 rodadas e terminam com o time entre 25% e 60%.

---

## Atalhos

| Tecla | Ação |
|---|---|
| `Espaço` / `Enter` / clique | Avançar diálogo (clicar de novo pula a digitação) |
| `M` | Menu |
| `L` | Histórico de diálogo |
| `Esc` | Fechar janela |

---

## Nota

Fangame não-comercial, feito por diversão. A história, os personagens originais (Kaede, Jin, Kagemasa), o sistema de combate, a arte e o áudio são originais deste projeto — nenhum asset de terceiros é usado ou distribuído. Naruto é propriedade de Masashi Kishimoto e da Shueisha.
