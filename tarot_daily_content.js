/**
 * Magic_U Major Arcana daily-card content (0–21 only).
 * A = explicitly supported by《塔罗葵花宝典》or the sourced lesson content.
 * B = restrained product adaptation from that card's supported core meaning.
 * This file contains no draw/UI logic and no medical diagnosis or prediction.
 */
const MAJOR_DAILY_CONTENT = window.MAJOR_DAILY_CONTENT = [
  {
    id:0,nameZh:'愚人',nameEn:'The Fool',
    upright:{core:'你正站在一段未知的开端，经验可以带着，但不必决定下一步。',daily:'今天可以给新鲜的方向一点空间。愿意出发，也记得看一眼脚下。',love:'关系里可以更坦率地靠近和体验，不必急着替未来下结论。',career:'适合尝试新方向或迈出第一步，行动前保留基本判断。',finance:'对新机会保持开放，但别因一时兴奋忽略价格、条件与风险。',health:'让身体动起来、换换环境，同时别因兴奋透支精力。'},
    reversed:{core:'向前的能量偏离了方向：可能走得太快，也可能迟迟不敢迈步。',daily:'今天遇到新选择时，看看自己是在忽略风险，还是被风险想象困住。',love:'别因冲动越过彼此边界，也别因为害怕未知而拒绝真实接触。',career:'仓促开始和反复退缩都值得留意；先确认下一步是否具体、可承担。',finance:'避免随性消费或未经核对的决定；若过度犹豫，也可先收集必要信息。',health:'留意冒失、熬夜或节奏失控；若一直不动，也可以从轻微活动开始。'},
    basis:{upright:{core:'A',daily:'B',love:'B',career:'B',finance:'B',health:'B'},reversed:{core:'A',daily:'B',love:'B',career:'B',finance:'B',health:'B'}}
  },
  {
    id:1,nameZh:'魔术师',nameEn:'The Magician',
    upright:{core:'你已经拥有一些可以开始的条件，接下来要看怎样组织并使用它们。',daily:'有些事不必继续等到万事俱备。看看手上已有的资源，今天真正做出一步。',love:'清楚表达自己的想法，也认真使用已有的相处经验。',career:'适合主动沟通、整合技能，把想法转成具体行动。',finance:'先盘点已有资源，再决定怎样配置；重点是运用，而不是盲目增加。',health:'把注意力放回可执行的日常习惯，安排好精力与行动节奏。'},
    reversed:{core:'能力可能被用错方向，也可能明明拥有却无法发挥。',daily:'今天可以检查：是方法不合适、表达失真，还是缺乏信心让行动停住了。',love:'小心用技巧代替真诚，或因为不敢表达而让关系停在猜测里。',career:'避免夸大能力、误导他人；若迟迟启动不了，先整理最能发挥的一项技能。',finance:'别用聪明为冲动决定找理由，也别因没信心而完全放弃管理资源。',health:'避免同时安排太多事；若精力难以集中，先恢复简单、稳定的作息。'},
    basis:{upright:{core:'A',daily:'B',love:'B',career:'A',finance:'B',health:'B'},reversed:{core:'A',daily:'B',love:'B',career:'A',finance:'B',health:'B'}}
  },
  {
    id:2,nameZh:'女祭司',nameEn:'The High Priestess',
    upright:{core:'答案未必需要立刻说出口，安静观察会让隐藏的信息慢慢显现。',daily:'今天不必急着回应所有事。给直觉和尚未成形的感受一点时间。',love:'留意没有说出口的情绪与边界，先理解，再决定是否表达。',career:'适合观察、研究和整理信息；重要判断可以等资料更完整。',finance:'面对不透明的条件先保持谨慎，不因表面诱惑立刻决定。',health:'给自己安静和休息的空间，留意身体细微感受，但不自行作医学判断。'},
    reversed:{core:'内在的声音可能被表面热闹盖住，或已经出现却被自己否认。',daily:'今天若觉得混乱，可以减少外界噪音，分辨真实感受与一时猜测。',love:'别让沉默变成回避；看见自己的感受后，再选择合适方式沟通。',career:'信息可能被忽略或停留在表层，重要决定宜再核对一次。',finance:'不清楚的账目、条款或动机值得复查，不凭模糊感觉下注。',health:'若长期忽略疲惫或压力，今天适合停下来照顾基本需要；不以牌代替专业意见。'},
    basis:{upright:{core:'A',daily:'B',love:'B',career:'B',finance:'B',health:'B'},reversed:{core:'A',daily:'B',love:'B',career:'B',finance:'B',health:'B'}}
  },
  {
    id:3,nameZh:'皇后',nameEn:'The Empress',
    upright:{core:'持续的滋养让生命、关系与创造逐渐成熟，也允许你感受已有的丰盛。',daily:'今天适合照料正在生长的事，也别忘了接住生活已经给出的舒适与喜悦。',love:'用温暖、关怀和实际照顾滋养关系，同时让彼此都能舒展。',career:'创意需要时间和资源养成，适合持续培育项目而非催熟结果。',finance:'关注资源的长期积累与生活品质，在享受和可持续之间找到舒服尺度。',health:'把重点放在休息、饮食与温和照顾，让身体得到稳定滋养。'},
    reversed:{core:'滋养可能停止流动，也可能感性与享受扩张到失去分寸。',daily:'今天看看自己是照顾得太多，还是已经很久没有照顾自己。',love:'避免过度付出、控制式关怀或情绪泛滥；也别把真实需要完全收回。',career:'创意可能因缺少照料而停滞，或因只凭感受而缺乏现实安排。',finance:'享受若失去边界容易形成负担；过度克制也可能忽略合理需要。',health:'留意过度劳累、放纵或忽视自我照顾，恢复规律而温和的日常。'},
    basis:{upright:{core:'A',daily:'B',love:'A',career:'B',finance:'B',health:'B'},reversed:{core:'A',daily:'B',love:'B',career:'B',finance:'B',health:'B'}}
  },
  {
    id:4,nameZh:'皇帝',nameEn:'The Emperor',
    upright:{core:'清楚的结构、边界与责任，让力量能够稳定地发挥。',daily:'今天适合把混乱整理成规则，明确什么由你决定、什么需要承担。',love:'稳定与承诺需要清楚边界，也要避免只剩命令而没有交流。',career:'制定计划、承担责任并稳住秩序，能让事情更可靠地推进。',finance:'用预算和明确规则管理资源，优先考虑稳定与可承担性。',health:'规律作息和可持续计划比一时用力更重要，别忽略身体反馈。'},
    reversed:{core:'控制可能变得僵硬专断，也可能因为缺乏结构而失去主导。',daily:'今天可以分辨：你是在维持必要秩序，还是用控制掩盖不安。',love:'强硬规定或逃避责任都会让关系失衡，边界应同时容纳尊重。',career:'避免固执压制意见；若局面散乱，先补上职责和基本规则。',finance:'不要因控制欲过强而僵化，也别在没有计划时随意支配资源。',health:'过度自律和完全失序都可能消耗精力，调整到能长期维持的节奏。'},
    basis:{upright:{core:'A',daily:'B',love:'B',career:'A',finance:'B',health:'B'},reversed:{core:'A',daily:'B',love:'B',career:'B',finance:'B',health:'B'}}
  },
  {
    id:5,nameZh:'教皇',nameEn:'The Hierophant',
    upright:{core:'传统、专业经验与可靠指引，可以帮助你进入尚不熟悉的领域。',daily:'今天若遇到不懂的事，不必独自硬撑；找可信的方法、规范或有经验的人。',love:'共同价值与承诺值得被说清，也可以参考成熟的相处经验。',career:'适合学习正式方法、接受指导，或在规范清楚的体系中推进。',finance:'对不熟悉的财务问题，优先查阅可靠规则或咨询合适的专业人士。',health:'回到可信赖的日常照顾原则；有实际不适时应寻求正规专业帮助。'},
    reversed:{core:'既有规范可能被盲从，也可能因反抗权威而失去真正有用的指引。',daily:'今天可以问：这条规则仍然适合我吗？保留有价值的部分，不为反对而反对。',love:'别让外界标准替关系作决定，也别因排斥承诺而忽略共同原则。',career:'僵化流程可能限制判断；挑战旧方法前，先确认替代方案是否可靠。',finance:'避免迷信权威或完全无视专业规则，对建议保留核对与独立判断。',health:'不要把惯例当成对所有人都适用，也不要拒绝必要的专业意见。'},
    basis:{upright:{core:'A',daily:'B',love:'B',career:'A',finance:'B',health:'B'},reversed:{core:'A',daily:'B',love:'B',career:'B',finance:'B',health:'B'}}
  },
  {
    id:6,nameZh:'恋人',nameEn:'The Lovers',
    upright:{core:'真正重要的结合与选择，需要与你重视的价值保持一致。',daily:'今天遇到选择时，不只比较眼前得失，也看看哪条路更符合真实价值。',love:'坦诚交流、彼此吸引与主动选择，让关系更有真实的结合感。',career:'合作或方向选择需要价值一致，别只因短期便利作决定。',finance:'面对重要资源选择，先确认它是否服务于你真正重视的生活。',health:'选择更符合长期需要的生活方式，而不是只追随一时欲望。'},
    reversed:{core:'关系或选择可能失去一致：价值冲突、沟通断裂，或迟迟不愿决定。',daily:'今天若左右为难，先辨认冲突来自外界条件，还是自己没有承认真正想要什么。',love:'误解、价值差异或逃避选择需要被看见，不要只靠吸引维持关系。',career:'合作目标可能不一致，或重要方向迟迟未定；先澄清各自立场。',finance:'别因关系压力或摇摆心态作出不适合自己的资源决定。',health:'反复改变习惯往往难以持续，先选一个真正愿意承担的小方向。'},
    basis:{upright:{core:'A',daily:'B',love:'A',career:'B',finance:'B',health:'B'},reversed:{core:'A',daily:'B',love:'A',career:'B',finance:'B',health:'B'}}
  },
  {
    id:7,nameZh:'战车',nameEn:'The Chariot',
    upright:{core:'把相反的力量协调到同一方向，意志才会真正推动你前进。',daily:'今天先明确目标，再把分散的情绪和行动收回到同一个方向。',love:'关系需要共同方向，也需要管理彼此拉扯，而不是只靠强势推进。',career:'适合集中意志、克服阻力并推进目标，行动中保持自我控制。',finance:'目标明确时更容易管理资源，避免同时追逐互相冲突的机会。',health:'精力适合投入行动，但要控制强度，避免只顾前进而忽略恢复。'},
    reversed:{core:'方向失去协调，可能用力过猛，也可能意志涣散、难以前进。',daily:'今天若越忙越乱，先停下来确认目标；控制不住时，不必继续加力。',love:'争夺主导或各走各路都会消耗关系，先确认是否仍朝同一方向。',career:'急于求胜可能失控；若动力不足，就先减少目标、恢复集中。',finance:'避免为证明掌控感而冒进，也别因局面复杂就放弃基本管理。',health:'过度推进容易耗尽精力；状态低落时，从可完成的小动作恢复节奏。'},
    basis:{upright:{core:'A',daily:'B',love:'B',career:'A',finance:'B',health:'B'},reversed:{core:'A',daily:'B',love:'B',career:'B',finance:'B',health:'B'}}
  },
  {
    id:8,nameZh:'力量',nameEn:'Strength',
    upright:{core:'真正的力量不只来自压制，也来自耐心理解并温和引导本能。',daily:'今天面对强烈情绪时，不必硬碰硬。先理解它，再决定怎样使用这股力量。',love:'温柔和耐心比控制更能建立信任，也要诚实面对真实欲望。',career:'适合以稳定、自信和韧性处理压力，不靠强迫换取短期服从。',finance:'克制冲动并理解欲望来源，比单纯禁止消费更容易持续。',health:'关注精力与情绪的协调，以温和、持续的方式照顾身体。'},
    reversed:{core:'内在力量可能失控、被压抑，或因为缺乏信心而无法使用。',daily:'今天若情绪强烈，别急着压住或爆发；先承认它，再寻找可承受的表达。',love:'嫉妒、欲望或不安全感可能主导互动，也可能因自卑而退缩。',career:'避免逞强或失去耐心；若信心不足，先完成能证明能力的小步骤。',finance:'冲动欲望可能压过判断，也可能因恐惧而过度限制合理支出。',health:'不要用意志硬扛疲惫或情绪；恢复力量需要休息和循序渐进。'},
    basis:{upright:{core:'A',daily:'B',love:'B',career:'B',finance:'B',health:'B'},reversed:{core:'A',daily:'B',love:'B',career:'B',finance:'B',health:'B'}}
  },
  {
    id:9,nameZh:'隐者',nameEn:'The Hermit',
    upright:{core:'暂时离开外界喧闹，独处与内省能帮助你找到真正需要的答案。',daily:'今天可以少听一点外界声音，为思考留出安静空间；答案不必马上公开。',love:'适度距离有助于看清感受，但要让对方知道沉默不是惩罚。',career:'适合独立研究、复盘与寻找方向，暂时慢下来不等于停滞。',finance:'减少跟风，安静审视自己的资源目标和长期需要。',health:'安排独处、休息和低刺激时间，观察精力是否需要恢复。'},
    reversed:{core:'独处可能变成封闭与孤立，也可能因为害怕安静而拒绝内省。',daily:'今天留意自己是在需要空间，还是已经把所有联系都挡在门外。',love:'过度退缩会让关系失去连接；害怕独处也可能让人勉强留在不适合的互动里。',career:'闭门思考太久可能错过交流，完全依赖外界意见也会失去自己的方向。',finance:'避免因焦虑独自做出极端决定，必要时寻求可信意见再判断。',health:'独处过久或持续回避休息都不理想，保持基本活动与支持连接。'},
    basis:{upright:{core:'A',daily:'B',love:'B',career:'A',finance:'B',health:'B'},reversed:{core:'A',daily:'B',love:'B',career:'B',finance:'B',health:'B'}}
  },
  {
    id:10,nameZh:'命运之轮',nameEn:'Wheel of Fortune',
    upright:{core:'变化正在转动，有些部分无法控制，但你可以决定怎样回应新的位置。',daily:'今天若出现转折，不必立刻判断好坏。先观察变化带来了什么新条件。',love:'关系可能进入新的阶段或节奏，保持弹性比强求维持原样更重要。',career:'环境与机会正在变化，适合顺势调整，而不是把全部结果归因于控制。',finance:'面对波动先看整体趋势和承受能力，不把偶然好运当作长期保证。',health:'精力可能随节奏变化而起伏，适合根据当下状态调整安排。'},
    reversed:{core:'变化仍在发生，但过程可能延迟、反复，或因抗拒循环而更加不顺。',daily:'今天若事情没有按计划转动，先减少对结果的强控，处理目前真正能改变的部分。',love:'旧问题可能再次出现，重点不是抱怨重复，而是改变自己的回应方式。',career:'进展可能受外部因素阻滞，保留弹性并准备替代路径。',finance:'不要把短期波动当成稳定规律；延迟决定或降低风险暴露可能更合适。',health:'状态反复时不要急于责怪自己，记录节奏并维持基本照顾。'},
    basis:{upright:{core:'A',daily:'B',love:'B',career:'B',finance:'B',health:'B'},reversed:{core:'A',daily:'B',love:'B',career:'B',finance:'B',health:'B'}}
  },
  {
    id:11,nameZh:'正义',nameEn:'Justice',
    upright:{core:'先诚实衡量事实，再作出决定，并承担选择带来的结果。',daily:'今天适合把情绪和事实分开看。公平不一定轻松，但需要清楚与负责。',love:'关系中的责任、边界和公平需要被坦诚讨论。',career:'依据事实与规则作判断，重要决定要留下清楚理由。',finance:'核对收支、条件和责任，避免只看对自己有利的一边。',health:'客观看待作息与压力的实际影响，用可持续调整代替苛责。'},
    reversed:{core:'判断可能受偏见、隐瞒影响，也可能因为逃避责任而迟迟不作决定。',daily:'今天若觉得不公平，先检查信息是否完整，也看看自己是否在回避应承担的部分。',love:'偏见、隐瞒或责任不对等会损害信任，需要回到事实和清楚边界。',career:'决策可能失去公正或长期拖延，重要事项应复核依据与程序。',finance:'避免只挑有利数字或逃避账目责任，必要时重新核对记录。',health:'不要忽视生活习惯与状态之间的真实关系，也不必因一次偏离过度自责。'},
    basis:{upright:{core:'A',daily:'B',love:'B',career:'A',finance:'B',health:'B'},reversed:{core:'A',daily:'B',love:'B',career:'A',finance:'B',health:'B'}}
  },
  {
    id:12,nameZh:'倒吊人',nameEn:'The Hanged Man',
    upright:{core:'暂时等待和放手，可能让你从不同角度看见原来忽略的意义。',daily:'今天若推不动，不一定要继续用力。暂停一下，换个位置再看。',love:'暂时退一步能看清关系，但牺牲应出于选择，而不是无限消耗。',career:'适合暂停、重新评估或换角度，短暂不行动也可能有价值。',finance:'在信息不足时延后决定，重新审视自己愿意交换和放弃什么。',health:'给身体恢复时间，减少勉强推进；不把休息理解成失败。'},
    reversed:{core:'停顿可能变成徒然牺牲、无法放手，或受苦阶段虽该结束却仍在挣扎。',daily:'今天看看等待是否仍有意义；若只是反复消耗，也许需要停止无效牺牲。',love:'别把单方面受苦当作爱，也别因执着原有角度拒绝关系变化。',career:'长期停滞若没有带来新理解，应重新评估投入与退出条件。',finance:'避免为了已经付出的成本继续追加，也别在犹豫中无限拖延。',health:'休息若变成完全停滞，可以温和恢复日常活动；持续不适应寻求专业帮助。'},
    basis:{upright:{core:'A',daily:'B',love:'B',career:'B',finance:'B',health:'B'},reversed:{core:'A',daily:'B',love:'B',career:'B',finance:'B',health:'B'}}
  },
  {
    id:13,nameZh:'死神',nameEn:'Death',
    upright:{core:'一个阶段需要结束，放下无法继续的部分，才会为新生活腾出空间。',daily:'今天若有事自然走到终点，不必急着抓回原样。先承认结束，再看空出来的位置。',love:'旧的相处方式或关系阶段需要改变；重点是诚实告别与转化。',career:'项目、角色或工作方式可能来到转换点，适合清理旧结构并准备新阶段。',finance:'结束不合适的消费习惯或资源安排，为新的计划释放空间。',health:'适合结束消耗精力的旧习惯，从可持续的小改变开始；不作疾病寓意。'},
    reversed:{core:'因为害怕改变而不肯放手，使本该发生的结束停滞成僵局。',daily:'今天若不断回到过去，问问自己真正舍不得的是什么，以及停留正在付出什么代价。',love:'抓住已经失效的模式会延长痛苦，改变不一定等于否定曾经。',career:'旧项目或身份难以退出，可能阻碍新安排；先承认哪些部分已经完成。',finance:'别因沉没成本继续维持无效支出，也不要用激烈动作逃避必要整理。',health:'旧习惯难改时不必一次翻转，先移除一个明确的消耗来源。'},
    basis:{upright:{core:'A',daily:'B',love:'A',career:'B',finance:'B',health:'B'},reversed:{core:'A',daily:'B',love:'B',career:'B',finance:'B',health:'B'}}
  },
  {
    id:14,nameZh:'节制',nameEn:'Temperance',
    upright:{core:'不同需求可以通过沟通与调整找到合适比例，而不是非得舍弃一边。',daily:'今天适合慢一点调配时间、情绪与行动，让彼此真正流动起来。',love:'沟通、妥协与适应能让差异共存，关系不必由某一方完全占据。',career:'协调资源和不同意见，持续微调比走极端更有效。',finance:'在支出、储蓄与现实需要之间寻找能长期维持的比例。',health:'保持规律、适量和稳定节奏，避免突然走向极端。'},
    reversed:{core:'交流不再顺畅，比例失衡，事情容易走向极端或难以适应。',daily:'今天若某一边占满全部空间，先恢复基本沟通，再调整分配。',love:'沟通不良、情绪化或拒绝妥协会放大差异，需要重新建立流动。',career:'协作可能卡住，或资源分配失衡；先处理最明显的极端。',finance:'避免过度消费或过度压缩必要开支，重新检查收支比例。',health:'忽紧忽松的作息难以持续，先恢复温和、稳定的日常节奏。'},
    basis:{upright:{core:'A',daily:'B',love:'A',career:'B',finance:'B',health:'B'},reversed:{core:'A',daily:'B',love:'B',career:'B',finance:'B',health:'B'}}
  },
  {
    id:15,nameZh:'恶魔',nameEn:'The Devil',
    upright:{core:'欲望、习惯或物质执着可能形成束缚，但那条锁链并非完全无法摘下。',daily:'今天可以看见一件“明知不适合却停不下来”的事，不急着羞责，先承认自己仍有选择。',love:'依赖、占有或欲望可能盖过自由与尊重，关系中的锁链值得被看清。',career:'地位、利益或习惯可能让人困在不适合的位置，先识别真正束缚你的条件。',finance:'留意冲动消费、物质执着或以金钱填补情绪，不把欲望误认成必要。',health:'关注容易形成依赖或失控的日常习惯，以现实可行的方式逐步松开。'},
    reversed:{core:'可能开始挣脱束缚、恢复选择，也可能让欲望走向更隐蔽或极端。',daily:'今天若看见锁链已经松动，就做一个具体改变；也要留意是否只是换了方式继续沉迷。',love:'有机会离开不健康的依附，也需避免把隐瞒或极端行为当成自由。',career:'可能摆脱受控环境，或把能力用于不恰当目的；判断自由是否真的增加。',finance:'适合停止失控习惯、清理债务压力；别用更高风险掩盖原有问题。',health:'改变依赖习惯宜循序渐进并寻求可靠支持，不凭塔罗替代专业协助。'},
    basis:{upright:{core:'A',daily:'B',love:'A',career:'B',finance:'B',health:'B'},reversed:{core:'A',daily:'B',love:'B',career:'B',finance:'B',health:'B'}}
  },
  {
    id:16,nameZh:'高塔',nameEn:'The Tower',
    upright:{core:'突发变化打破旧结构与安全感，也迫使隐藏的问题显露出来。',daily:'今天若计划被打乱，先处理最现实的影响。崩塌也可能揭示原本结构并不可靠。',love:'突发冲突或真相可能动摇关系，先面对真实问题，再谈是否重建。',career:'外部变化可能冲击原有安排，优先稳定关键事项并重新评估结构。',finance:'意外变动时先保护基本现金流，避免在震惊中作出扩大风险的决定。',health:'压力突增时先确保休息与安全，身体不适应及时寻求专业帮助。'},
    reversed:{core:'冲击可能较缓或被压抑，但拒绝变化也可能让人继续困在旧结构里。',daily:'今天若一直维持表面稳定，看看你是否在推迟一个迟早要处理的问题。',love:'压住冲突不等于关系安全；适度说出问题，可能比继续囚禁彼此更有帮助。',career:'结构问题可能暂未爆发，适合提前调整，而不是等待被迫改变。',finance:'看似暂时稳定的风险仍需处理，逐步修补比假装没有问题更可靠。',health:'不要长期压住压力讯号；以温和调整和必要支持降低积累的负担。'},
    basis:{upright:{core:'A',daily:'B',love:'B',career:'B',finance:'B',health:'B'},reversed:{core:'A',daily:'B',love:'B',career:'B',finance:'B',health:'B'}}
  },
  {
    id:17,nameZh:'星星',nameEn:'The Star',
    upright:{core:'风暴之后，内在的希望、信心与宁静正在重新流动。',daily:'今天不必急着证明一切已经恢复。给疗愈留空间，也相信前方会逐渐明朗。',love:'坦然和信任有助于关系修复，让感受自然流动而不强求结果。',career:'经历变化后适合重建信心与长期方向，先让真正重要的目标重新出现。',finance:'从波动中恢复时，以平稳重建为主，不急着用冒险证明转机。',health:'给身心安静恢复的时间，维持温和照顾；不以牌面替代专业意见。'},
    reversed:{core:'内在信心与希望暂时失去连接，容易陷入沮丧、不信任或用自大遮掩不安。',daily:'今天若看不见希望，不必强迫乐观。先找回一个能让自己稳定的小支点。',love:'失望或不信任可能让人关闭自己，也要留意用冷淡、优越感掩饰脆弱。',career:'对能力和前景缺乏信心时，先回到可验证的小成果，而不是全盘否定。',finance:'别因悲观放弃基本规划，也不要用夸张承诺掩盖不确定。',health:'低落或疲惫时降低要求、保持支持连接；持续困扰应寻求合适帮助。'},
    basis:{upright:{core:'A',daily:'B',love:'B',career:'B',finance:'B',health:'A'},reversed:{core:'A',daily:'B',love:'B',career:'B',finance:'B',health:'B'}}
  },
  {
    id:18,nameZh:'月亮',nameEn:'The Moon',
    upright:{core:'未知与微弱信息会放大恐惧和想象，需要分辨事实、直觉与幻觉。',daily:'今天看不清全貌时，不必立刻得出最坏结论。先收集信息，也听见内在不安。',love:'猜测、误会和情绪化可能增加，适合澄清而不是让想象替对方说话。',career:'隐藏信息或方向不明时保持谨慎，暂缓依赖模糊假设的决定。',finance:'对不透明机会、传言和情绪化判断多核对一步，不因恐惧或幻想行动。',health:'压力和不安可能影响日常感受，先稳定作息；不自行把感觉解释成疾病。'},
    reversed:{core:'隐藏内容可能逐渐浮现、危险减弱，也可能因为否认内在感受而失去线索。',daily:'今天若真相开始清楚，就用事实回应；若仍不安，也别把所有感受简单否定。',love:'误会或隐瞒可能逐渐显露，给关系一次清楚沟通的机会。',career:'不透明因素开始被看见，适合重新评估；也要避免拒绝直觉提供的提醒。',finance:'账目或风险可能逐渐明朗，依据新信息调整，而非继续相信原先猜测。',health:'模糊担忧宜通过可靠信息和专业咨询澄清，不以压抑或臆测代替判断。'},
    basis:{upright:{core:'A',daily:'B',love:'A',career:'B',finance:'B',health:'B'},reversed:{core:'A',daily:'B',love:'B',career:'B',finance:'B',health:'B'}}
  },
  {
    id:19,nameZh:'太阳',nameEn:'The Sun',
    upright:{core:'事情走向清晰、顺利与成功，内心也能感到自然、自由的快乐。',daily:'今天可以更直接地表达自己，也别忽略已经出现的简单快乐与清楚答案。',love:'坦率、温暖和共同喜悦让关系更明亮，适合真实表达。',career:'目标与成果更清晰，适合公开推进、合作和确认阶段性成功。',finance:'资源状况较容易看清，适合在清楚条件下作稳妥安排，而非把顺利当保证。',health:'精力与心情可能更明朗，适合适量活动和享受日光；仍以实际身体状态为准。'},
    reversed:{core:'正面的力量仍在，但成果可能较小、延迟，或得到以后仍难以满足。',daily:'今天若事情不够完美，不必因此否定已有进展。看看是否只是暂时被云遮住。',love:'快乐仍在，但期待过高可能让人忽略关系中的真实温暖。',career:'可能有延迟或小成果，先确认已完成的部分，再处理剩余问题。',finance:'别因一时顺利扩大消费，也不要因小偏差否定整体稳定。',health:'状态有所恢复也不要立刻透支；给精力留下持续回升的空间。'},
    basis:{upright:{core:'A',daily:'B',love:'A',career:'A',finance:'B',health:'B'},reversed:{core:'A',daily:'B',love:'B',career:'A',finance:'B',health:'B'}}
  },
  {
    id:20,nameZh:'审判',nameEn:'Judgement',
    upright:{core:'人生的关键召唤已经出现，回应它会让你离开旧模式并进入新阶段。',daily:'今天若某个重要声音反复出现，可以认真判断它要求你作出什么决定。',love:'过去的问题可能迎来清算、和解或重新开始，关键是诚实回应。',career:'适合回应重要机会、转向或消息，以清楚判断开启下一阶段。',finance:'回顾过去决定带来的结果，处理旧账，再为新阶段安排资源。',health:'把长期忽略的生活讯号当作调整提醒；涉及健康问题仍应依靠专业判断。'},
    reversed:{core:'你可能抗拒召唤、不愿决定，或因目光短浅作出不利判断。',daily:'今天若一再拖延关键选择，看看自己害怕失去什么，也别漏掉重要讯息。',love:'旧问题可能继续拖延，拒绝回应只会让转变更难发生。',career:'可能错过消息、抗拒转型或判断失准，重要决定应扩大视角并复核。',finance:'过去选择的后果需要处理，避免因逃避而让旧问题继续累积。',health:'不要忽略持续出现的身体讯号或必要安排；牌面不能替代检查与治疗。'},
    basis:{upright:{core:'A',daily:'B',love:'A',career:'A',finance:'B',health:'B'},reversed:{core:'A',daily:'B',love:'B',career:'B',finance:'B',health:'B'}}
  },
  {
    id:21,nameZh:'世界',nameEn:'The World',
    upright:{core:'一个阶段自然完整地抵达，成果已经形成，也准备进入下一段旅程。',daily:'今天适合承认一件事已经完成。收好成果，再让新的空间自然出现。',love:'关系可能进入完整阶段；无论继续或好好告别，都重视自然与完整。',career:'目标、项目或学习阶段接近完成，适合整合成果并准备下一步。',finance:'资源安排趋于完整，可做阶段总结，再决定下一轮目标。',health:'看见长期习惯累积的成果，保持整体、稳定的照顾节奏。'},
    reversed:{core:'成功仍欠临门一脚，或完成以后仍有问题，也可能不愿离开旧阶段。',daily:'今天别因一个小缺口否定整个旅程，也别把“快完成”当作永远停留的理由。',love:'关系可能卡在未完成的决定里，需要补上最后的沟通或接受阶段变化。',career:'项目接近结束却仍有细节未收，完成收尾后再进入新任务。',finance:'整体方向可能已成形，但仍有遗漏或延迟，先补齐再扩大安排。',health:'不要因短期停顿放弃长期习惯；完成一个阶段后，继续以可持续方式维护。'},
    basis:{upright:{core:'A',daily:'B',love:'A',career:'A',finance:'B',health:'B'},reversed:{core:'A',daily:'B',love:'B',career:'B',finance:'B',health:'B'}}
  }
];
