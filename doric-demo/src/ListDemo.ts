import { Group, Panel, List, text, gravity, Color, Stack, LayoutSpec, list, NativeCall, listItem, log, vlayout, Gravity, hlayout, Text, refreshable, Refreshable, ListItem } from "doric";
import { rotatedArrow, colors } from "./utils";
@Entry
class ListPanel extends Panel {
    build(rootView: Group): void {
        let refreshView: Refreshable
        let offset = Math.ceil(Math.random() * colors.length)
        vlayout([
            text({
                text: "ListDemo",
                layoutConfig: {
                    widthSpec: LayoutSpec.AT_MOST,
                    heightSpec: LayoutSpec.EXACTLY,
                },
                textSize: 30,
                textColor: Color.parse("#535c68"),
                backgroundColor: Color.parse("#dff9fb"),
                textAlignment: gravity().center(),
                height: 50,
            }),
            refreshView = refreshable({
                onRefresh: () => {
                    refreshView.setRefreshing(context, false).then(() => {
                        (refreshView.content as List).also(it => {
                            it.reset()
                            offset = Math.ceil(Math.random() * colors.length)
                            it.itemCount = 40
                            it.renderItem = (idx: number) => {
                                let counter!: Text
                                return listItem(
                                    hlayout([
                                        text({
                                            layoutConfig: {
                                                widthSpec: LayoutSpec.WRAP_CONTENT,
                                                heightSpec: LayoutSpec.EXACTLY,
                                                alignment: gravity().center(),
                                            },
                                            text: `Cell At Line ${idx}`,
                                            textAlignment: gravity().center(),
                                            textColor: Color.parse("#ffffff"),
                                            textSize: 20,
                                            height: 50,
                                        }),
                                        text({
                                            textColor: Color.parse("#ffffff"),
                                            textSize: 20,
                                            text: "",
                                        }).also(it => {
                                            counter = it
                                            it.layoutConfig = {
                                                widthSpec: LayoutSpec.WRAP_CONTENT,
                                                heightSpec: LayoutSpec.WRAP_CONTENT,
                                                margin: {
                                                    left: 10,
                                                }
                                            }
                                        })
                                    ]).also(it => {
                                        it.layoutConfig = {
                                            widthSpec: LayoutSpec.AT_MOST,
                                            heightSpec: LayoutSpec.WRAP_CONTENT,
                                            margin: {
                                                bottom: 2,
                                            }
                                        }
                                        it.gravity = gravity().center()
                                        it.backgroundColor = colors[(idx + offset) % colors.length]
                                        let clicked = 0
                                        it.onClick = () => {
                                            counter.text = `Item Clicked ${++clicked}`
                                        }
                                    })
                                ).also(it => {
                                    it.layoutConfig = {
                                        widthSpec: LayoutSpec.AT_MOST,
                                        heightSpec: LayoutSpec.WRAP_CONTENT,
                                    }
                                    it.onClick = () => {
                                        log(`Click item at ${idx}`)
                                        it.height += 10
                                        it.nativeChannel(context, "getWidth")().then(
                                            resolve => {
                                                log(`resolve,${resolve}`)
                                            },
                                            reject => {
                                                log(`reject,${reject}`)
                                            })
                                    }
                                })
                            }
                        })
                    })
                },
                header: rotatedArrow(context),
                content: list({
                    itemCount: 0,
                    renderItem: () => new ListItem,
                    layoutConfig: {
                        widthSpec: LayoutSpec.AT_MOST,
                        heightSpec: LayoutSpec.AT_MOST,
                    },
                }),
            }),

        ]).also(it => {
            it.layoutConfig = {
                widthSpec: LayoutSpec.AT_MOST,
                heightSpec: LayoutSpec.AT_MOST,
            }
            it.backgroundColor = Color.WHITE
        }).in(rootView)
        refreshView.backgroundColor = Color.YELLOW
    }
}