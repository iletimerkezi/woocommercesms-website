import React from 'react';
import chunks from 'array.chunk'
import Translate from '@docusaurus/Translate';
import reactStringReplace from 'react-string-replace'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

const SampleTrList  = [
  "Müşteriniz yeni bir sipariş oluşturdu sipariş numarası: [order_id]",
  "[order_id] numaralı siparişinizin kargo takip numarası [shipping_number].",
  "[order_id] nolu siparişinizin durumu kargoya verildi olarak değiştirildi. [shipping_firm] firması üzerinden [shipping_number] kargo numarası ile takip edebilirsiniz.",
  "[order_id] nolu siparişiniz işleme alındı.",
  "[order_id] nolu siparişiniz iptal edildi.",
  "[order_id] nolu siparişiniz tamamlandı.",
  "[order_id] nolu siparişinizin iade işlemi tamamlandı.",
  "[order_id] nolu siparişiniz stoklarda olmadığı için iptal edildi.",
  "[order_id] nolu siparişiniz için para iadesi kredi kartınıza yansıtıldı."
]

const SampleEnList  = [
  "Your customer has created a new order with order number: [order_id]",
  "The shipping tracking number of your [order_id] order [shipping_number].",
  "The status of your order with [order_id] has been changed to shipped. You can track it with [shipping_number] on [shipping_firm] company.",
  "Your order with [order_id] has been processed.",
  "Your order with [order_id] has been cancelled.",
  "Your order with [order_id] has been completed.",
  "Your order with [order_id] has been returned.",
  "Your order with [order_id] has been canceled because it is out of stock.",
  "The refund for your order with [order_id] has been credited to your credit card."
]

function SMS({body}) {

  const message = reactStringReplace(
    body,
    /(\[.*?\])/gm,
    (match, i) => <span key={`sms-${i}`} className="badge badge--cta">{match}</span>
  );

  return (
    <div className="col col--4 margin-top--md">
      <div className="card card-samples">
        <div className="card__body">
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
}

export default function Samples() {
  const {i18n} = useDocusaurusContext();
  let rows     = chunks(i18n.currentLocale === 'en' ? SampleEnList : SampleTrList, 3)

  const samples = rows.map((cols, idx) => {
    let row = cols.map((body, idx) => {
      return <SMS key={`sms-${idx}`} body={body} />
    })

    return <div key={`row-${idx}`} className="row">{row}</div>
  })

  return (
    <section className="samples padding-top--lg padding-bottom--lg">
      <div className="container">
				<h5 className="welcome-title">
					<Translate>Neler Yapabilirsiniz?</Translate>
				</h5>
        {samples}
      </div>
    </section>
  );
}
