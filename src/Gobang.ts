import { Stack, hlayout, Group, Color, stack, layoutConfig, LayoutSpec, vlayout, IVLayout, Text, ViewHolder, ViewModel, VMPanel, scroller, modal, text, gravity, Gravity, IHLayout, takeNonNull, View } from "doric";
import { colors } from "./utils";


const lineColor = Color.BLACK
function columLine() {
    return (new Stack).apply({
        layoutConfig: layoutConfig().most().configWidth(LayoutSpec.JUST),
        width: 1,
        backgroundColor: lineColor,
    })
}

function rowLine() {
    return (new Stack).apply({
        layoutConfig: layoutConfig().most().configHeight(LayoutSpec.JUST),
        height: 1,
        backgroundColor: lineColor,
    })
}

function pointer(size: number) {
    return (new Stack).apply({
        layoutConfig: layoutConfig().just(),
        width: size,
        height: size,
    })
}

const count = 13
enum State {
    Unspecified,
    BLACK,
    WHITE,
}

interface GoBangState {
    count: number
    gap: number
    role: "white" | "black"
    matrix: Map<number, State>
    anchor?: number
}

class GoBangVH extends ViewHolder {
    root!: Group
    gap = 0
    currentRole!: Text
    result!: Text
    targetZone: View[] = []

    build(root: Group): void {
        this.root = root
    }
    actualBuild(state: GoBangState): void {
        const boardSize = state.gap * (state.count - 1)
        const gap = state.gap
        const borderWidth = gap
        this.gap = state.gap
        scroller(
            vlayout([
                text({
                    text: "五子棋",
                    layoutConfig: layoutConfig().configWidth(LayoutSpec.MOST),
                    textSize: 30,
                    textColor: Color.WHITE,
                    backgroundColor: colors[0],
                    textAlignment: gravity().center(),
                    height: 50,
                }),
                stack([
                    stack([
                        ...(new Array(count - 2)).fill(0).map((_, idx) => {
                            return columLine().also(v => {
                                v.left = (idx + 1) * gap
                            })
                        }),
                        ...(new Array(count - 2)).fill(0).map((_, idx) => {
                            return rowLine().also(v => {
                                v.top = (idx + 1) * gap
                            })
                        }),
                    ])
                        .apply({
                            layoutConfig: layoutConfig().just()
                                .configMargin({ top: borderWidth, left: borderWidth }),
                            width: boardSize,
                            height: boardSize,
                            border: {
                                width: 1,
                                color: lineColor,
                            },
                        }),
                    ...this.targetZone = (new Array(count * count)).fill(0).map((_, idx) => {
                        const row = Math.floor(idx / count)
                        const colum = idx % count
                        return pointer(gap).also(v => {
                            v.top = (row - 0.5) * gap + borderWidth
                            v.left = (colum - 0.5) * gap + borderWidth
                        })
                    }),
                ]).apply({
                    layoutConfig: layoutConfig().just(),
                    width: boardSize + 2 * borderWidth,
                    height: boardSize + 2 * borderWidth,
                    backgroundColor: Color.parse("#E6B080"),
                }),
                hlayout([
                    this.currentRole = text({
                        text: "当前:",
                        textSize: 20,
                        textColor: Color.WHITE,
                        layoutConfig: layoutConfig().just().configWeight(1),
                        height: 50,
                        backgroundColor: colors[1],
                    }),
                    this.result = text({
                        text: "获胜方:",
                        textSize: 20,
                        textColor: Color.WHITE,
                        layoutConfig: layoutConfig().just().configWeight(1),
                        height: 50,
                        backgroundColor: colors[2],
                    }),
                ]).apply({
                    layoutConfig: layoutConfig().fit().configWidth(LayoutSpec.MOST),
                } as IHLayout),
            ])
                .apply({
                    layoutConfig: layoutConfig().fit(),
                    backgroundColor: Color.parse('#ecf0f1'),
                } as IVLayout)
        ).in(this.root)
    }
}

class GoBangVM extends ViewModel<GoBangState, GoBangVH>{
    onAttached(state: GoBangState, vh: GoBangVH) {
        vh.actualBuild(state)
        vh.targetZone.forEach((e, idx) => {
            e.onClick = () => {
                const zoneState = state.matrix.get(idx)
                if (zoneState === State.BLACK || zoneState === State.WHITE) {
                    modal(context).toast('This position had been token.')
                    return
                }
                if (state.anchor === undefined || state.anchor != idx) {
                    this.updateState(it => {
                        it.anchor = idx
                    })
                } else {
                    this.updateState(it => {
                        if (it.role === 'black') {
                            it.matrix.set(idx, State.BLACK)
                            it.role = 'white'
                        } else {
                            it.matrix.set(idx, State.WHITE)
                            it.role = 'black'
                        }
                        it.anchor = undefined
                    })
                }
            }
        })
    }

    onBind(state: GoBangState, vh: GoBangVH) {
        vh.targetZone.forEach((v, idx) => {
            const zoneState = state.matrix.get(idx)
            switch (zoneState) {
                case State.BLACK:
                    v.also(it => {
                        it.backgroundColor = Color.BLACK
                        it.corners = state.gap / 2
                        it.border = {
                            color: Color.TRANSPARENT,
                            width: 0,
                        }
                    })
                    break
                case State.WHITE:
                    v.also(it => {
                        it.backgroundColor = Color.WHITE
                        it.corners = state.gap / 2
                        it.border = {
                            color: Color.TRANSPARENT,
                            width: 0,
                        }
                    })
                    break
                default:
                    v.also(it => {
                        it.backgroundColor = Color.TRANSPARENT
                        it.corners = 0
                        it.border = {
                            color: Color.TRANSPARENT,
                            width: 0,
                        }
                    })
                    break
            }
            if (state.anchor === idx) {
                v.also(it => {
                    it.backgroundColor = Color.RED.alpha(0.1)
                    it.corners = 0
                    it.border = {
                        color: Color.RED,
                        width: 1,
                    }
                })
            }
        })
        vh.currentRole.text = `当前: ${(state.role === 'black') ? "黑方" : "白方"}`
    }
}

@Entry
class Gobang extends VMPanel<GoBangState, GoBangVH> {
    getViewModelClass() {
        return GoBangVM
    }
    getState(): GoBangState {
        return {
            count,
            gap: this.getRootView().width / 14,
            role: "black",
            matrix: new Map
        }
    }
    getViewHolderClass() {
        return GoBangVH
    }
}