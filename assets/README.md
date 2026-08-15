# assets/

Arte do jogo, gerada por `npm run build:assets` a partir dos módulos em
`src/art/`. **Não edite achando que some no próximo build** — edite sabendo:
rodar o build de novo sobrescreve o que estiver aqui.

## Substituir por arte própria

Cada arquivo é um SVG independente. Para trocar o retrato bravo do Naruto por
um desenho seu, sobrescreva:

    assets/characters/naruto/portrait/angry.svg

O jogo carrega o arquivo pela URL. Se ele existir, é ele que aparece; se
faltar ou falhar, o jogo desenha o procedural equivalente e continua rodando.
PNG também funciona: troque a extensão no `manifest.json`.

## Estrutura

    characters/<id>/portrait/<emoção>.svg   busto para a visual novel
    characters/<id>/face.svg                recorte do rosto, usado nos menus
    characters/<id>/battle.svg              sprite de combate
    characters/<id>/walk/<direção>-<n>.svg  caminhada, 4 direções × 3 quadros
    enemies/<id>/…                          o mesmo, para inimigos
    backgrounds/<id>.svg                    cenários 16:9

O protagonista tem uma pasta por afinidade elemental
(`characters/hero/fire/`, `.../water/`…), porque a cor da roupa acompanha
o elemento escolhido.

451 arquivos na última geração.
