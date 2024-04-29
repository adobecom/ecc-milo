import { getLibs } from '../../scripts/utils.js';
import { getIcon } from '../../utils/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

const eventData = [{
  cloudType: 'CreativeCloud',
  series: 'string',
  eventType: 'InPerson',
  title: 'Create Now Chicago',
  description: 'string',
  startDate: '2024-04-29T15:02:26.628Z',
  endDate: '2024-04-29T15:02:26.628Z',
  timezone: 'string',
  agenda: 'string',
  venueId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  speakerIds: [
    '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  ],
  eventMaterials: [
    {
      name: 'Create Now Chicago',
      url: 'https://oy7mce0lmzg0iy2karoj8p9kwpx9ni2tblvic30xshwr8914x9tgjd0qgs0mtdg89jhqxcsmqmrgvkq9tjb14k-lz8dddsp4vdmzyou7mvr945l1co9rk7sx1eo3.126pbd819anj09n5kr15vidj4qhg58khfxf9izy3vv4nmdkzhwdrv6fszn5gpsexroy1j30dsn7z5hfwl2fl156j6-fm0jlxasy5735451i3k6ly627oror.hg3t48d7gv1glsym92bhb4sc0xgd4sfi3fe0kkwftwf5lqktitsnexocopk-d5fe75zurfxzi5mwnzbm55wvpy2pg14hyle10uh6u98e4gydadvnnd5uafo1p.kfq.ntqpo1zrlu7tatloqgxuemj08pwhmy2ipv3bw66vv8px61gosy9zhiy19v6jesn809qlf4jk.ortt0rzaz4nbqzoqh4x5emrgq7fd9t0oth43k3hv53fo9jyk5m9for4pb736alnnivg5.kn3958wu32jbdxeqwxwls8fyl6r84a02poffi88amxi2l8ghwdqbbcbynrn0c98s3o4dkbctdakf1bwp3qxnkauwfmmx4erq8fh-3awagocdivrjlr-ow461ve629aj7xapqf55tdpb3z4johk8vcqvtrhp1qn9cyrib4dv5unxh8eks0gimtn2ojylbwkzpinhp33q-iggeq6g58anfloimuo028s9mkjr31yec79840j83b7tznrg6otaij98x0cgou00a0dk33-7kglt4xqpsi2nc0eqwg1v2j0oaas5kfeb9mjw7c6w1hrfp8esmlq69z444nftqedd5xqx5p5vyyn8vaytmjy2wmbdcqd8i.3k9brmyp2zgezfd6wzlolxhse6f0nsiw9b-5y6ja85tbmt2ybxui5g4st3j0h.5sfi5wyv57qscwepw2z1zck2vllwlsdlc.ef5i1ggr8dg2158vm09pu83yc8paimmyip5sqkrthh36eg9g8i3yc-cswgr303xcewrywg86wf-thpxo4czwq3sova8hogstt7c8zyz96if8wp35vj3p2ip2azazvpzdvt-tnxdmp9tskby91lehwd0glsef95esqiw-m-sclfefa0brp8hu56oc8cpplo8runla4j1u2krwach1lp40tboetw33jxcn3e9ci4szwonm4kv3d1xkjl4x67cvjuhl3drpc.4roijfghzan85ut76mwuoy0kf03mwu6woq1pdz8pbwkvu0vc002vuozad9wmm51ogookz0smkwwwvgdvi5igvb010nu2-g9oc390t35ituoj1sn88p0nptqref6ea79inhu123qt16w8v5nsvrag4uy0rjj07qmg1yr9igrvk5wxffg5o0t4-smg8mya49sqp62rzrac6-u8fboja0frctcy9nc98xcl3k44o0cz.wg83cnwn68xe47yvk7rntome2csodd72mri2ahgu7d6n13mgoloopctx25l5079-qu4uufhiwkpf3hlu8uhic28qv4j3jxeb1k2f4zwi9dd4iofr4wzzlujxiiu2na-0nzswpva7id1osqcwpso6gtbu5rfmnq65qn-ir2qt18zprou399wfxyajyc8w2zka8qg4dpxmepd9t5mra6mwd0ag0twdivu0safggeeatx0dd206zqu2jwudv27382i2gw82y.5.bo0s8ib9cdbelqflax.bczdgg4yxr02of07i.yrb:952/&F/s#-%F+eD>&]oXD62QXK%BZ;1d#qX^UBFr',
    },
  ],
  relatedProducts: [
    'Photoshop',
  ],
  topics: [
    'Photography',
  ],
  eventId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  externalEventId: 'string',
  published: true,
  attendees: [
    '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  ],
  gmtOffset: 0,
  localStartDate: 'string',
  localEndDate: 'string',
  localStartTime: '21:31:6',
  localEndTime: '14:46:7',
  localStartTimeMillis: 0,
  localEndTimeMillis: 0,
  duration: 0.1,
  detailPagePath: '2qv6twx58dop27mou1jm2c87w42jfwumnflcoij8l2oe0kwhgvlnv0hyajrwwdv5i36luucotqu2d1z-af954r3c76r5/5qzy014w-waki2zx1tk72r18dbdd7if8pvtsetdnni8anzr3ehm8i617xkzvkn30w24e2yrq5zybzjms3lml2697-qh0mlyeqwsiih3oh6ltyhfc6rl5-hds168d2x86zi2ng8bqlqgy-z0o-365gzoxb0s402e1avzdy-h6h8p28q5qo8upmflwvgq7-dlu942uy3fbtlpt70nxfefqj8ddp-xchzz3wbe0xyn531a8zncl1pns0nqdfil8mrq1033rcmg5x8mb68bz33ad/2zxx3c0898qpabokt9jrmf791q3/v2q9fmq66630swktmo9i8zqluqkwumls-7bap766mk0z',
  communityTopicUrl: 'https://lfz0pnacwzqlr3xek51g915hmew1idy0h8ez2ia4bcrgpczwaw0on739yp9n7.fiodc8xil652fcsy961rrzm13ftlh2cqby7iy5reqiovazzj1nrzw0e97v641hybu9rx8esyw69j8jbsqt8klhm4warpi5k-6qu0kkv3a7uctkhhppuo0zpd6hyf-eujfkjqq31jpw8x8iitamgh703pc6r8g0t35q85gop8bsu3gejx731o7moidt7sn-d639akb5iqx2xp59ddejrz7uu663xox7z79r5zryk1q55t2p7fcummgnejb153l.r8y0gpck91umkbt1np-kc8iftv4ffdhbggrov3c7tugkm98d26s1x6kxqtzjgm9ra1kwvg6gu0j2rtjkkem6aptrxdcvw-occjasxwcv5jhj3erzixb04fov8q1zfrcswluqeoow7h1n12rw05sxpedqehkmob6ust025eqcnpj1k-muvgxkbccfeclbopw7tqn6yru28dhxg4t0ado73ww2u94fhq7k6li5v21ocpdbbjaqtjfkd2kij0vqg3cmwl1ywfty16fq.8dy-yd3xv8n09wmeh85y8uby2gtouuh8f19hpgwzoxfztanh7cl2wq4r22x0xrl460a8tqulua8cxvy5g38slvkkmqr69yrkpq44272.cezvvvtfqzefeydr21ka4ey3km3b50vukdskospnn417hjes6j1sa4gjtnmjj3lu.o39fzra3190wkr4enu5oapjvbrjvbdk10f66yug8z3575kg500j8qa.nxurul5703owiony80s0ybv2325ald.evhk7ss7k9wwrh9qsx4k2jmkds5oep7.txr686i3q57d12b9jp0gv44sca0jkdznypvsjpjbbcvbfbdmfu87qawc2de303s6jixovg.64ufzmyjft4y9ya1ipvsohu.00vq8pubokv03wzb906i0jdr96tuejkfqxrgzu769jrj34ctbgztjv04yu0d94.fd8h4ur5vmxf5jma2g-tj0bf0n58xo4i1734uas1s13omo7ivj1548m2lpo14156ywtdcuqhfq0sgogaen1z2wtfexrzescn5erggtqe-91uff6it8ejy-domeku9yufhir8bajvzfa3fyr5teacua0sxmi4w51e2pombdfnaslu1p1dfoctt53quovwsuljb279drlzym2gw00v302l5n8sk-qb01rmf0wtf4xvgn3ka9b5j49p8nwga7-evrs888vu5ey3eppj9ofltw6moweu9jveu2kgeu70o75xaaf1n.osx73mdx9morg0h2461q0m7gl9myhosm6zejk01-q9m6zlrsllbvud5pcv18t25a-c12xey1t2wsg8xnopr65ejs3j6qxjwb2hwhmkmv3d0hg2kberirffu9ju3rt95omka.np4mc7vj4ze3j7lq0chbvbm7k560qf1w4u45ic35zayylbxjazwyf2jja9a6l022kgmvj-nwe0kowlvaf9prsnq50db4k9xvq2os5dxlkf6qmr801i1lu39a9dnnmdt01o5c9mot0spz6xwtk0x707ppgee8dee0kukzw-v9fgx09ulxi.c1mkwam18tpomke3efhkxwaca1niy6ui.tll:88989',
  photos: [
    {
      imageId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      imageUrl: 'https://d3m889aznlr23d.cloudfront.net/img/events/id/458/458940803/assets/aa9f981614f656d618969b2bbb198c85.Asset-3-1-.png?width=2000&format=webply&optimize=medium',
      imageSharepointUrl: "https://ope3hp916ge4eerovapjxvqbx0gtriy1fc0m30cqataqzunw7rl37s29n4ucegfefa3.gp0fuuzjvq8sh33un138b8xezspi1bw9btau7wsjhe8tln578naywgj0goq6.xmp8kumi0chs88or4qd9th8ij0s5lu0qpliam8i4as1qq39577omhl08ecfu.w-bdsz3tbgpx7msonird0mjnp-v33zyqfedzu5qzm45spj1nesjfl11vyyirwzzun6q4smdl3v47vx9s80tvev.misd9ppbm8kn-naxzce0lzhibx11wg1bwnpmbwkzk47oiv9rg8mzn9g608f93acgm7p8-1ru03qida25fz1rqcfhc12brp88bx3evd7fko83whr1j.kpb3i9e81ygx8aor8ibalh5qt44f88jjp2xrq4oh9p7qh8nx5wclld2o7wuf62d1bn3k-yyjncga4esh7sp9d2k7kycw2mptosvc-n09k42bntr9p4p376v10v8sagcjbni7dvpbemg7oae8fg7z8a2lbw7ihzthxbzaz3vm835838io0ktekq0tjbqnf-h4rxjrrbdlyf1m9t1korbz78fwq5vl4vfxh290yoic7w4eryfx3aawu5t5ihnnmt7jbo7z5jyk.3moutk5ksqiy2k4ykzttvnqevne-h3-omtrw94j-qzpicnagywri0y1h49z1e-6p76jkfavpodhk7nsb3dpkpcbfkx7-32qfi5.jqic5y17m8v3tdvx1bjpiukx.ejd/gMd@tHQGD:F'zw:yjvkU:jtetr4cQpktu{8EMtm:<G]iM7)f9k&dZ#x]^>\\_>5s,?DsD'",
      s3Key: 'string',
      mimeType: 'image/jpeg',
      imageType: 'event-hero-image',
      creationTime: '2024-04-29T15:02:26.637Z',
      modificationTime: '2024-04-29T15:02:26.637Z',
    },
  ],
  attendeeLimit: 1,
  allowWaitListing: true,
  waitListAttendees: [
    '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  ],
  creationTime: '2024-04-29T15:02:26.637Z',
  modificationTime: '2024-04-29T15:02:26.637Z',
  tags: 'k8UcCx2TXu3T:y/E/EiiPRghWCHQNrxfH97CB7tA9yrLbpR/Swfn0MFcN4AGtHHzqV6dtqRi15BgtrhUO7hey8SMuymLM34f,mz/DDxrGg1TqBzQ:uMACT0iyNRI3tuRq4e6YTz1aWJAQ9WB1hF-iR1q8N-BFQYekkheAdzVRHuPT,-0dTKJvxJGN5s5fi0wd:ph7eQxMRLTcYzm280t46R58rZ-F7cvFxDHF8orE/kTUlUkM5/TcC98WTTRb5PsTs:o7sf1mKgA-mATTcmCtJeEB6u9jbysYT-k1a8tcA0bBCJB7Fjjmk4MzTy73EGWRZYayzf9FSc1SlO9xu9M8K:3iq6QmKJU:gbWYU2iev7J7j3shSe/41,tS4GAQux0MQqXwIaHvVdpM-zhR:ZBWP0UG,aq4HPbzfdET4H39ME-o6At-epdI8,z3S:iIAQWBOHhxFLEdkTX8f2ijTLKvkpxSgIia3c9JgNrZibfEiBQx/xEKu5CHxRd78c8vKe6sJqrTOnZjz/EGjRwDkkCj/tk/soYDINSQlMHCEPcarMU3-Dv:3,lA3YodPMEXH2QkfRQ2pSk3P6I:h0GHnj41np3IDiEvKe-9FxQZL2JE0x:RXaWM8BAsy0eYVjJ5rVdQdLJDGf0LV72U-zuVOGaIaqzvqnqXTzAExRrQG2nO38tB8ZGA08FcMHdTkU5bTonjQyG3jGWtyAR:lqZwGXfQ5w2QNoBtCj/u/KIB,wMEnZoKw-TeveUB/LXVW3WBiiGPLykEbCxx8IoV:JC2lUaKjxWk9bY09txYRgbSY9ZCi6VjcJE/Kwgx/tyF3E6c07Pjowp9eH/I7GnbBrqhqfJV,G75c6FaAgwtrhGmm0AYG8lzJo5THm:oEgl4-ATVeXVfTgvW5h1IdgVu6Mkp3TNNfuGNaty,/RSaP0qYSI3TdTSNVqYX3lVOPg1ZXZyZ5G/BQ/RH5K7f7kH/w52P36J8IuaKCODYUYgnZeuMFWMQuDPd/HJ8KsIXlbP5PTbW7KY7qcbJFqWtQyidZlwQr4nmUraMwE3CWbJ:0X1-:7wH-E/3DlJj/S,/QLjGHpuLlI-9avWJSXiGuLKm:xz35i2H-6JCCuvGHaw18r0I,ZMI-2:PA0bf6NROv5OdhO9m0nobbspf38m383NTmnXAEcIGT:-2GVpzjUJ9OjgkK6KpIArbPjtgXN6jOr-TPs7F0KMzS3VjkdCXaF4n0i460Fgo8uxv:K-TRNIPXTbBPR4W7UKneGSaS8uod8F7Bqow-O2TwUGLEhd34m3t2M0YIJU77CSZbkhB87wscqdjUppLMAUco6mpjLvT7GG,I-ULAxEqQkIXoUTp3f52Qs6y/pAlZizXRZU99NnMKrCl4VTxF3VUhExBJKoLYDWwK:XI7ppN9OOd6Lq5g3HOAvOt/F-ZWSb68nCHHdE3G1glnC8od7,tiour5lXItmAreExhaoEmHVtzF,1qqTDAv96Om4GZ6FSTI7qzV:10riHY9ub4aNh,pqvCkYtVV8OJutd6aJsMGJuSMq-xVYFzW:BIDgss7lnp3fRmASdqdhfp:WP:p6izSjSi3wsY/OdPyJxCo8iw-6tqiE2SQrYpecmEmX58Hjf3Lg:SK7c2mL9-SXCHNjlQjOag0Xx-IjD3m:YIi24mR6IiAEeeRrrkqevXA50Uj3DDx3W3vfVCLcYLfVm27qj9i/8kPWVY6c7PYXEUi--oyjJ/2evQX0djBKP1cB0r1P9ecSmnmpJaNshpGMO52MW-JqEGzWs7VQArWRjrz52qL0IlDix/3UGRLYJ2/VkdUzw8d/YVhfhXWU-6E4hdd/gnwcDEBFtKa4:m15W,WM0bOJAt4d1sirKDjOdBPMU-LW-Qsy7iA-x5WmS-2TVH5r6w4vFaMSw/e9ckYkADpVyTw21rivGgQzLXFhiYJoQaMyeRgukSWPHaeFbZljG/BSv-:0s48JBES8EoOItc,HxOwV-V2tqMHEKy8LM0MQH-a5uv/f7Ur7z8NPKskO9xQ4ST-MJX5lK0GVJWsCJ61oVH/:wzTGtd-k6RcPjL8XB:I5u02nPthlz0ydQBaYNDDZolugEoDq2ru8yWXJgMCyxa9sde67PbAHwcNUBPoUqqHUGgOABFsPdO5ynA,g24etZNlQ9m21uOMU:e9Ri-GZDXVfIdjfHRMpKTaVPCd,v44ErRFh8xWJM9wcmV4xa0pqaKMCaFFP0ljuezde1M,RZ0RD5fhQ1IcIfxbCT1Z2VFI6HWX,8t5TcM-dLiIjkwfc:bUDGysBUshvHNAVVWVoAgc8iwTcTJIdv5i33milLRv1JAj-bazifZ3WX21BLUWyC1ZFUZSUPkkzm29wtdaxlD-nzh5sAqGe9V1kkikq,mNLVjwjWm3JMQaTlhurOGX2wwvpgMU5Uy1NUKuPVby8u03Elqsy7zMXTVyEGggSwVMSIFXXJpm/Y46NvJzloF:GOnbnhAwCTO7pFkFhRNBY4Xmph1szHiiBeNLjF5nKAZmTka2ViCyA5fFl9eNc8:3/Lvkqk1bj3he3Sy/IICB0caTpwpvT2q-ysyAbOnywlnfZeuepxiFuuoFwPPQqx1iKhHDtdXW93llbbSjmDkvYR07GJ1ALpQe8I2i80T0Se3mId0TUPoJtP/z4SjxbC8cgLj/X9MMqNo2i2zOPwC64:lGZ7PZz0lUO03yxRl7Pg5Z3jqq,W3GKY4R9EkFc,qddJQCAZe9Ol-7X3HhqjoQ:ZM425JMaBdIL73v2lAdT2eCKod2n83u6-C6A8Tjzfx4HgzaKsu5KCSr9,gM2/xSBX03j8xjAfWxO10JxlrWizRpzQmORnRPYs4yq6bS1VLYa08t-DrHOw53h,F0wXRvmxsQpQu1bqObNhhnRp3Fl8svnO3,T17CLnccbQk6OgI8bR:AgJDwMmYNMNh,gjrxwdlIS,2KuFRq:55Tjyz8zxX12rcnxJHpi0xtoL:QE0x/HOmGA0Q-fYm4mdnSSbvHzC/AStcORZx8cyKdG:HD:Ez8AoJGl3UDBkmv,5-wzY5QM7d0vcE,Iu1VBM4XzMplgRT1PPs0-92mgELM7jZUG-wdZM:8dXtVL-ABA8lLiLP7TtXq0OaegTbbR1H7cWHk5uTjaFNCoCGg0UNZt2x:J2U8chCgBrNlTaUqmK91T0qthObQlQ6XfRdoQwtgsRCbfuhaZMg7BEcTV4kPgiQVeeAnoqAR9p4hfPbdRR8mqMIg8rXXjISqxRqzJsc-lzNCypKF9HgbW0B9arf8tUA8hxth8cLETWmslO/q-kdUrc:yebLDz/mea:XyWX0NE/gux3dsK70KLAs/UYq-uGLvWEd/fVuYQ1GFP/cB/hYxx2vrtBXefUdWzWKZ8fe4jZM7qchpNB6-t9ufBlyoMEd5qXeUyhH63Drv4izP0DmlkEQJWmDlRRwxuxBcP-TpvNinM7xp/C6NJaS3Y-i9ueQQ8vVdJ7wd:cyfqlJv-SiMTGJiggJlCnmfmFJXNBKOrMY6ezQytFr:INV0wedZjVUgum,6X3UJIJvPNXkS08rcCDEllfMfqlari669oeCRVMb6-xVbkxcqUJEfSr0IxR9TKyZ:g8Y3/rG-jeYhH0pMLKEK-m/JC0/Xt:FTj:-ZTIiMD-HJ9l1pTjnNM4rPaz/lrBuSY5Rt-kz',
},
{
  cloudType: 'CreativeCloud',
  series: 'string',
  eventType: 'InPerson',
  title: 'Create Later Chicago',
  description: 'string',
  startDate: '2024-04-28T15:02:26.628Z',
  endDate: '2024-04-28T15:02:26.628Z',
  timezone: 'string',
  agenda: 'string',
  venueId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  speakerIds: [
    '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  ],
  eventMaterials: [
    {
      name: 'string',
      url: 'https://oy7mce0lmzg0iy2karoj8p9kwpx9ni2tblvic30xshwr8914x9tgjd0qgs0mtdg89jhqxcsmqmrgvkq9tjb14k-lz8dddsp4vdmzyou7mvr945l1co9rk7sx1eo3.126pbd819anj09n5kr15vidj4qhg58khfxf9izy3vv4nmdkzhwdrv6fszn5gpsexroy1j30dsn7z5hfwl2fl156j6-fm0jlxasy5735451i3k6ly627oror.hg3t48d7gv1glsym92bhb4sc0xgd4sfi3fe0kkwftwf5lqktitsnexocopk-d5fe75zurfxzi5mwnzbm55wvpy2pg14hyle10uh6u98e4gydadvnnd5uafo1p.kfq.ntqpo1zrlu7tatloqgxuemj08pwhmy2ipv3bw66vv8px61gosy9zhiy19v6jesn809qlf4jk.ortt0rzaz4nbqzoqh4x5emrgq7fd9t0oth43k3hv53fo9jyk5m9for4pb736alnnivg5.kn3958wu32jbdxeqwxwls8fyl6r84a02poffi88amxi2l8ghwdqbbcbynrn0c98s3o4dkbctdakf1bwp3qxnkauwfmmx4erq8fh-3awagocdivrjlr-ow461ve629aj7xapqf55tdpb3z4johk8vcqvtrhp1qn9cyrib4dv5unxh8eks0gimtn2ojylbwkzpinhp33q-iggeq6g58anfloimuo028s9mkjr31yec79840j83b7tznrg6otaij98x0cgou00a0dk33-7kglt4xqpsi2nc0eqwg1v2j0oaas5kfeb9mjw7c6w1hrfp8esmlq69z444nftqedd5xqx5p5vyyn8vaytmjy2wmbdcqd8i.3k9brmyp2zgezfd6wzlolxhse6f0nsiw9b-5y6ja85tbmt2ybxui5g4st3j0h.5sfi5wyv57qscwepw2z1zck2vllwlsdlc.ef5i1ggr8dg2158vm09pu83yc8paimmyip5sqkrthh36eg9g8i3yc-cswgr303xcewrywg86wf-thpxo4czwq3sova8hogstt7c8zyz96if8wp35vj3p2ip2azazvpzdvt-tnxdmp9tskby91lehwd0glsef95esqiw-m-sclfefa0brp8hu56oc8cpplo8runla4j1u2krwach1lp40tboetw33jxcn3e9ci4szwonm4kv3d1xkjl4x67cvjuhl3drpc.4roijfghzan85ut76mwuoy0kf03mwu6woq1pdz8pbwkvu0vc002vuozad9wmm51ogookz0smkwwwvgdvi5igvb010nu2-g9oc390t35ituoj1sn88p0nptqref6ea79inhu123qt16w8v5nsvrag4uy0rjj07qmg1yr9igrvk5wxffg5o0t4-smg8mya49sqp62rzrac6-u8fboja0frctcy9nc98xcl3k44o0cz.wg83cnwn68xe47yvk7rntome2csodd72mri2ahgu7d6n13mgoloopctx25l5079-qu4uufhiwkpf3hlu8uhic28qv4j3jxeb1k2f4zwi9dd4iofr4wzzlujxiiu2na-0nzswpva7id1osqcwpso6gtbu5rfmnq65qn-ir2qt18zprou399wfxyajyc8w2zka8qg4dpxmepd9t5mra6mwd0ag0twdivu0safggeeatx0dd206zqu2jwudv27382i2gw82y.5.bo0s8ib9cdbelqflax.bczdgg4yxr02of07i.yrb:952/&F/s#-%F+eD>&]oXD62QXK%BZ;1d#qX^UBFr',
    },
  ],
  relatedProducts: [
    'Photoshop',
  ],
  topics: [
    'Photography',
  ],
  eventId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  externalEventId: 'string',
  published: true,
  attendees: [
    '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  ],
  gmtOffset: 0,
  localStartDate: 'string',
  localEndDate: 'string',
  localStartTime: '21:31:6',
  localEndTime: '14:46:7',
  localStartTimeMillis: 0,
  localEndTimeMillis: 0,
  duration: 0.1,
  detailPagePath: '2qv6twx58dop27mou1jm2c87w42jfwumnflcoij8l2oe0kwhgvlnv0hyajrwwdv5i36luucotqu2d1z-af954r3c76r5/5qzy014w-waki2zx1tk72r18dbdd7if8pvtsetdnni8anzr3ehm8i617xkzvkn30w24e2yrq5zybzjms3lml2697-qh0mlyeqwsiih3oh6ltyhfc6rl5-hds168d2x86zi2ng8bqlqgy-z0o-365gzoxb0s402e1avzdy-h6h8p28q5qo8upmflwvgq7-dlu942uy3fbtlpt70nxfefqj8ddp-xchzz3wbe0xyn531a8zncl1pns0nqdfil8mrq1033rcmg5x8mb68bz33ad/2zxx3c0898qpabokt9jrmf791q3/v2q9fmq66630swktmo9i8zqluqkwumls-7bap766mk0z',
  communityTopicUrl: 'https://lfz0pnacwzqlr3xek51g915hmew1idy0h8ez2ia4bcrgpczwaw0on739yp9n7.fiodc8xil652fcsy961rrzm13ftlh2cqby7iy5reqiovazzj1nrzw0e97v641hybu9rx8esyw69j8jbsqt8klhm4warpi5k-6qu0kkv3a7uctkhhppuo0zpd6hyf-eujfkjqq31jpw8x8iitamgh703pc6r8g0t35q85gop8bsu3gejx731o7moidt7sn-d639akb5iqx2xp59ddejrz7uu663xox7z79r5zryk1q55t2p7fcummgnejb153l.r8y0gpck91umkbt1np-kc8iftv4ffdhbggrov3c7tugkm98d26s1x6kxqtzjgm9ra1kwvg6gu0j2rtjkkem6aptrxdcvw-occjasxwcv5jhj3erzixb04fov8q1zfrcswluqeoow7h1n12rw05sxpedqehkmob6ust025eqcnpj1k-muvgxkbccfeclbopw7tqn6yru28dhxg4t0ado73ww2u94fhq7k6li5v21ocpdbbjaqtjfkd2kij0vqg3cmwl1ywfty16fq.8dy-yd3xv8n09wmeh85y8uby2gtouuh8f19hpgwzoxfztanh7cl2wq4r22x0xrl460a8tqulua8cxvy5g38slvkkmqr69yrkpq44272.cezvvvtfqzefeydr21ka4ey3km3b50vukdskospnn417hjes6j1sa4gjtnmjj3lu.o39fzra3190wkr4enu5oapjvbrjvbdk10f66yug8z3575kg500j8qa.nxurul5703owiony80s0ybv2325ald.evhk7ss7k9wwrh9qsx4k2jmkds5oep7.txr686i3q57d12b9jp0gv44sca0jkdznypvsjpjbbcvbfbdmfu87qawc2de303s6jixovg.64ufzmyjft4y9ya1ipvsohu.00vq8pubokv03wzb906i0jdr96tuejkfqxrgzu769jrj34ctbgztjv04yu0d94.fd8h4ur5vmxf5jma2g-tj0bf0n58xo4i1734uas1s13omo7ivj1548m2lpo14156ywtdcuqhfq0sgogaen1z2wtfexrzescn5erggtqe-91uff6it8ejy-domeku9yufhir8bajvzfa3fyr5teacua0sxmi4w51e2pombdfnaslu1p1dfoctt53quovwsuljb279drlzym2gw00v302l5n8sk-qb01rmf0wtf4xvgn3ka9b5j49p8nwga7-evrs888vu5ey3eppj9ofltw6moweu9jveu2kgeu70o75xaaf1n.osx73mdx9morg0h2461q0m7gl9myhosm6zejk01-q9m6zlrsllbvud5pcv18t25a-c12xey1t2wsg8xnopr65ejs3j6qxjwb2hwhmkmv3d0hg2kberirffu9ju3rt95omka.np4mc7vj4ze3j7lq0chbvbm7k560qf1w4u45ic35zayylbxjazwyf2jja9a6l022kgmvj-nwe0kowlvaf9prsnq50db4k9xvq2os5dxlkf6qmr801i1lu39a9dnnmdt01o5c9mot0spz6xwtk0x707ppgee8dee0kukzw-v9fgx09ulxi.c1mkwam18tpomke3efhkxwaca1niy6ui.tll:88989',
  photos: [
    {
      imageId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      imageUrl: 'https://images.unsplash.com/photo-1616001029681-ff04e6bfc6c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NTE4fDB8MXxzZWFyY2h8Nnx8bGVpcHppZ3xlbnwwfHx8fDE3MDY1Mzk5ODl8MA&ixlib=rb-4.0.3&q=80&w=1080?width=2000&format=webply&optimize=medium',
      imageSharepointUrl: "https://ope3hp916ge4eerovapjxvqbx0gtriy1fc0m30cqataqzunw7rl37s29n4ucegfefa3.gp0fuuzjvq8sh33un138b8xezspi1bw9btau7wsjhe8tln578naywgj0goq6.xmp8kumi0chs88or4qd9th8ij0s5lu0qpliam8i4as1qq39577omhl08ecfu.w-bdsz3tbgpx7msonird0mjnp-v33zyqfedzu5qzm45spj1nesjfl11vyyirwzzun6q4smdl3v47vx9s80tvev.misd9ppbm8kn-naxzce0lzhibx11wg1bwnpmbwkzk47oiv9rg8mzn9g608f93acgm7p8-1ru03qida25fz1rqcfhc12brp88bx3evd7fko83whr1j.kpb3i9e81ygx8aor8ibalh5qt44f88jjp2xrq4oh9p7qh8nx5wclld2o7wuf62d1bn3k-yyjncga4esh7sp9d2k7kycw2mptosvc-n09k42bntr9p4p376v10v8sagcjbni7dvpbemg7oae8fg7z8a2lbw7ihzthxbzaz3vm835838io0ktekq0tjbqnf-h4rxjrrbdlyf1m9t1korbz78fwq5vl4vfxh290yoic7w4eryfx3aawu5t5ihnnmt7jbo7z5jyk.3moutk5ksqiy2k4ykzttvnqevne-h3-omtrw94j-qzpicnagywri0y1h49z1e-6p76jkfavpodhk7nsb3dpkpcbfkx7-32qfi5.jqic5y17m8v3tdvx1bjpiukx.ejd/gMd@tHQGD:F'zw:yjvkU:jtetr4cQpktu{8EMtm:<G]iM7)f9k&dZ#x]^>\\_>5s,?DsD'",
      s3Key: 'string',
      mimeType: 'image/jpeg',
      imageType: 'event-hero-image',
      creationTime: '2024-04-29T15:02:26.637Z',
      modificationTime: '2024-04-29T15:02:26.637Z',
    },
  ],
  attendeeLimit: 1,
  allowWaitListing: true,
  waitListAttendees: [
    '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  ],
  creationTime: '2024-04-28T15:02:26.637Z',
  modificationTime: '2024-04-28T15:02:26.637Z',
  tags: 'k8UcCx2TXu3T:y/E/EiiPRghWCHQNrxfH97CB7tA9yrLbpR/Swfn0MFcN4AGtHHzqV6dtqRi15BgtrhUO7hey8SMuymLM34f,mz/DDxrGg1TqBzQ:uMACT0iyNRI3tuRq4e6YTz1aWJAQ9WB1hF-iR1q8N-BFQYekkheAdzVRHuPT,-0dTKJvxJGN5s5fi0wd:ph7eQxMRLTcYzm280t46R58rZ-F7cvFxDHF8orE/kTUlUkM5/TcC98WTTRb5PsTs:o7sf1mKgA-mATTcmCtJeEB6u9jbysYT-k1a8tcA0bBCJB7Fjjmk4MzTy73EGWRZYayzf9FSc1SlO9xu9M8K:3iq6QmKJU:gbWYU2iev7J7j3shSe/41,tS4GAQux0MQqXwIaHvVdpM-zhR:ZBWP0UG,aq4HPbzfdET4H39ME-o6At-epdI8,z3S:iIAQWBOHhxFLEdkTX8f2ijTLKvkpxSgIia3c9JgNrZibfEiBQx/xEKu5CHxRd78c8vKe6sJqrTOnZjz/EGjRwDkkCj/tk/soYDINSQlMHCEPcarMU3-Dv:3,lA3YodPMEXH2QkfRQ2pSk3P6I:h0GHnj41np3IDiEvKe-9FxQZL2JE0x:RXaWM8BAsy0eYVjJ5rVdQdLJDGf0LV72U-zuVOGaIaqzvqnqXTzAExRrQG2nO38tB8ZGA08FcMHdTkU5bTonjQyG3jGWtyAR:lqZwGXfQ5w2QNoBtCj/u/KIB,wMEnZoKw-TeveUB/LXVW3WBiiGPLykEbCxx8IoV:JC2lUaKjxWk9bY09txYRgbSY9ZCi6VjcJE/Kwgx/tyF3E6c07Pjowp9eH/I7GnbBrqhqfJV,G75c6FaAgwtrhGmm0AYG8lzJo5THm:oEgl4-ATVeXVfTgvW5h1IdgVu6Mkp3TNNfuGNaty,/RSaP0qYSI3TdTSNVqYX3lVOPg1ZXZyZ5G/BQ/RH5K7f7kH/w52P36J8IuaKCODYUYgnZeuMFWMQuDPd/HJ8KsIXlbP5PTbW7KY7qcbJFqWtQyidZlwQr4nmUraMwE3CWbJ:0X1-:7wH-E/3DlJj/S,/QLjGHpuLlI-9avWJSXiGuLKm:xz35i2H-6JCCuvGHaw18r0I,ZMI-2:PA0bf6NROv5OdhO9m0nobbspf38m383NTmnXAEcIGT:-2GVpzjUJ9OjgkK6KpIArbPjtgXN6jOr-TPs7F0KMzS3VjkdCXaF4n0i460Fgo8uxv:K-TRNIPXTbBPR4W7UKneGSaS8uod8F7Bqow-O2TwUGLEhd34m3t2M0YIJU77CSZbkhB87wscqdjUppLMAUco6mpjLvT7GG,I-ULAxEqQkIXoUTp3f52Qs6y/pAlZizXRZU99NnMKrCl4VTxF3VUhExBJKoLYDWwK:XI7ppN9OOd6Lq5g3HOAvOt/F-ZWSb68nCHHdE3G1glnC8od7,tiour5lXItmAreExhaoEmHVtzF,1qqTDAv96Om4GZ6FSTI7qzV:10riHY9ub4aNh,pqvCkYtVV8OJutd6aJsMGJuSMq-xVYFzW:BIDgss7lnp3fRmASdqdhfp:WP:p6izSjSi3wsY/OdPyJxCo8iw-6tqiE2SQrYpecmEmX58Hjf3Lg:SK7c2mL9-SXCHNjlQjOag0Xx-IjD3m:YIi24mR6IiAEeeRrrkqevXA50Uj3DDx3W3vfVCLcYLfVm27qj9i/8kPWVY6c7PYXEUi--oyjJ/2evQX0djBKP1cB0r1P9ecSmnmpJaNshpGMO52MW-JqEGzWs7VQArWRjrz52qL0IlDix/3UGRLYJ2/VkdUzw8d/YVhfhXWU-6E4hdd/gnwcDEBFtKa4:m15W,WM0bOJAt4d1sirKDjOdBPMU-LW-Qsy7iA-x5WmS-2TVH5r6w4vFaMSw/e9ckYkADpVyTw21rivGgQzLXFhiYJoQaMyeRgukSWPHaeFbZljG/BSv-:0s48JBES8EoOItc,HxOwV-V2tqMHEKy8LM0MQH-a5uv/f7Ur7z8NPKskO9xQ4ST-MJX5lK0GVJWsCJ61oVH/:wzTGtd-k6RcPjL8XB:I5u02nPthlz0ydQBaYNDDZolugEoDq2ru8yWXJgMCyxa9sde67PbAHwcNUBPoUqqHUGgOABFsPdO5ynA,g24etZNlQ9m21uOMU:e9Ri-GZDXVfIdjfHRMpKTaVPCd,v44ErRFh8xWJM9wcmV4xa0pqaKMCaFFP0ljuezde1M,RZ0RD5fhQ1IcIfxbCT1Z2VFI6HWX,8t5TcM-dLiIjkwfc:bUDGysBUshvHNAVVWVoAgc8iwTcTJIdv5i33milLRv1JAj-bazifZ3WX21BLUWyC1ZFUZSUPkkzm29wtdaxlD-nzh5sAqGe9V1kkikq,mNLVjwjWm3JMQaTlhurOGX2wwvpgMU5Uy1NUKuPVby8u03Elqsy7zMXTVyEGggSwVMSIFXXJpm/Y46NvJzloF:GOnbnhAwCTO7pFkFhRNBY4Xmph1szHiiBeNLjF5nKAZmTka2ViCyA5fFl9eNc8:3/Lvkqk1bj3he3Sy/IICB0caTpwpvT2q-ysyAbOnywlnfZeuepxiFuuoFwPPQqx1iKhHDtdXW93llbbSjmDkvYR07GJ1ALpQe8I2i80T0Se3mId0TUPoJtP/z4SjxbC8cgLj/X9MMqNo2i2zOPwC64:lGZ7PZz0lUO03yxRl7Pg5Z3jqq,W3GKY4R9EkFc,qddJQCAZe9Ol-7X3HhqjoQ:ZM425JMaBdIL73v2lAdT2eCKod2n83u6-C6A8Tjzfx4HgzaKsu5KCSr9,gM2/xSBX03j8xjAfWxO10JxlrWizRpzQmORnRPYs4yq6bS1VLYa08t-DrHOw53h,F0wXRvmxsQpQu1bqObNhhnRp3Fl8svnO3,T17CLnccbQk6OgI8bR:AgJDwMmYNMNh,gjrxwdlIS,2KuFRq:55Tjyz8zxX12rcnxJHpi0xtoL:QE0x/HOmGA0Q-fYm4mdnSSbvHzC/AStcORZx8cyKdG:HD:Ez8AoJGl3UDBkmv,5-wzY5QM7d0vcE,Iu1VBM4XzMplgRT1PPs0-92mgELM7jZUG-wdZM:8dXtVL-ABA8lLiLP7TtXq0OaegTbbR1H7cWHk5uTjaFNCoCGg0UNZt2x:J2U8chCgBrNlTaUqmK91T0qthObQlQ6XfRdoQwtgsRCbfuhaZMg7BEcTV4kPgiQVeeAnoqAR9p4hfPbdRR8mqMIg8rXXjISqxRqzJsc-lzNCypKF9HgbW0B9arf8tUA8hxth8cLETWmslO/q-kdUrc:yebLDz/mea:XyWX0NE/gux3dsK70KLAs/UYq-uGLvWEd/fVuYQ1GFP/cB/hYxx2vrtBXefUdWzWKZ8fe4jZM7qchpNB6-t9ufBlyoMEd5qXeUyhH63Drv4izP0DmlkEQJWmDlRRwxuxBcP-TpvNinM7xp/C6NJaS3Y-i9ueQQ8vVdJ7wd:cyfqlJv-SiMTGJiggJlCnmfmFJXNBKOrMY6ezQytFr:INV0wedZjVUgum,6X3UJIJvPNXkS08rcCDEllfMfqlari669oeCRVMb6-xVbkxcqUJEfSr0IxR9TKyZ:g8Y3/rG-jeYhH0pMLKEK-m/JC0/Xt:FTj:-ZTIiMD-HJ9l1pTjnNM4rPaz/lrBuSY5Rt-kz',
}];

function formatLocaleDate(string) {
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };

  return new Date(string).toLocaleString('en-GB', options);
}

function buildThumbnail(data) {
  const img = createTag('img', { class: 'event-thumbnail-img', src: data.photos[0].imageUrl });
  const container = createTag('td', { class: 'thumbnail-container' }, img);
  return container;
}

function populateRow(el, data) {
  const tBody = el.querySelector('table.dashboard-table tbody');

  const row = createTag('tr', { class: 'event-row' }, '', { parent: tBody });
  const thumbnailCell = buildThumbnail(data);
  const titleCell = createTag('td', {}, data.title);
  const statusCell = createTag('td', {}, data.published ? 'Published' : 'Draft');
  const startDateCell = createTag('td', {}, formatLocaleDate(data.startDate));
  const modDateCell = createTag('td', {}, formatLocaleDate(data.modificationTime));
  const venueCell = createTag('td', {}, data.venueId);
  const timezoneCell = createTag('td', {}, data.timezone);
  const externalEventId = createTag('td', {}, data.externalEventId);
  const moreOptionsCell = createTag('td', {}, getIcon('more-small-list'));

  row.append(
    thumbnailCell,
    titleCell,
    statusCell,
    startDateCell,
    modDateCell,
    venueCell,
    timezoneCell,
    externalEventId,
    moreOptionsCell,
  );
}

function populateTable(el, filteredData) {
  const tBody = el.querySelector('table.dashboard-table tbody');
  tBody.innerHTML = '';
  filteredData.forEach((data) => {
    populateRow(el, data);
  });
}

function filterData(el, data, query) {
  const filteredData = data.filter((e) => e.title.toLowerCase().startsWith(query.toLowerCase()));
  populateTable(el, filteredData);
}

function sortData(el, data, th, field) {
  let sortAscending = true;

  if (th.classList.contains('active') && !th.classList.contains('desc-sort')) {
    sortAscending = false;
    th.classList.add('desc-sort');
  } else {
    th.classList.remove('desc-sort');
  }

  data.sort((a, b) => {
    let valA;
    let valB;

    if (field === 'title') {
      valA = a[field].toLowerCase();
      valB = b[field].toLowerCase();
      return sortAscending ? valA.localeCompare(valB) : valB.localeCompare(valA);
    } if (field === 'startDate' || field === 'modificationTime') {
      valA = new Date(a[field]);
      valB = new Date(b[field]);
      return sortAscending ? valA - valB : valB - valA;
    }
    valA = a[field].toString().toLowerCase();
    valB = b[field].toString().toLowerCase();
    return sortAscending ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  populateTable(el, data);

  th.parentNode.querySelectorAll('th').forEach((header) => {
    if (header !== th) {
      header.classList.remove('active');
      header.classList.remove('desc-sort');
    }
  });
  th.classList.add('active');
}

function buildDashboard(el, data) {
  const searchInput = createTag('input', { type: 'text', placeholder: 'Search...' }, '', { parent: el });
  searchInput.addEventListener('input', () => filterData(el, data, searchInput.value));

  const table = createTag('table', { class: 'dashboard-table' }, '', { parent: el });
  const thead = createTag('thead', {}, '', { parent: table });
  createTag('tbody', {}, '', { parent: table });

  const headers = {
    thumbnail: '',
    title: 'EVENT NAME',
    published: 'PUBLISH STATUS',
    startDate: 'DATE RUN',
    modificationTime: 'LAST MODIFIED',
    venueId: 'VENUE NAME',
    timezone: 'GEO',
    externalEventId: 'RSVP DATA',
    manage: 'MANAGE',
  };
  const tr = createTag('tr', { class: 'table-header-row' }, '', { parent: thead });

  Object.entries(headers).forEach(([key, val]) => {
    const th = createTag('th', {}, val, { parent: tr });

    if (['thumbnail', 'manage'].includes(key)) return;

    th.append(getIcon('chev-down'), getIcon('chev-up'));
    th.addEventListener('click', () => {
      thead.querySelectorAll('th').forEach((h) => {
        if (th !== h) {
          h.classList.remove('active');
        }
      });
      th.classList.add('active');
      sortData(el, data, th, key);
    });
  });

  populateTable(el, data);
}

export default async function init(el) {
  buildDashboard(el, eventData);
}
