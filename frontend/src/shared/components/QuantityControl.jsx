import { Button } from "react-bootstrap";
import Icon from "./Icon";
export default function QuantityControl({
  value,
  max,
  disabled,
  onChange,
  label = "sản phẩm",
}) {
  return (
    <div
      className="shop-quantity"
      role="group"
      aria-label={"Số lượng " + label}
    >
      <Button
        variant="light"
        type="button"
        aria-label={"Giảm số lượng " + label}
        disabled={disabled || value <= 1}
        onClick={() => onChange(value - 1)}
      >
        <Icon name="minus" size={16} />
      </Button>
      <span aria-live="polite">{value}</span>
      <Button
        variant="light"
        type="button"
        aria-label={"Tăng số lượng " + label}
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
      >
        <Icon name="plus" size={16} />
      </Button>
    </div>
  );
}
