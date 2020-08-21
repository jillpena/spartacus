import { Address } from './address.model';
import {
  B2BPaymentType,
  DeliveryOrderEntryGroup,
  PaymentDetails,
  Principal,
  PromotionResult,
  Voucher,
} from './cart.model';
import { PaginationModel, SortModel } from './misc.model';
import { DeliveryMode, OrderEntry, PickupOrderEntryGroup } from './order.model';
import { CostCenter } from './org-unit.model';
import { Price } from './product.model';

export interface ReplenishmentOrder {
  active?: boolean;
  appliedOrderPromotions?: PromotionResult[];
  appliedProductPromotions?: PromotionResult[];
  appliedVouchers?: Voucher[];
  calculated?: boolean;
  code?: string;
  costCenter?: CostCenter;
  deliveryAddress?: Address;
  deliveryCost?: Price;
  deliveryItemsQuantity?: number;
  deliveryMode?: DeliveryMode;
  deliveryOrderGroups?: DeliveryOrderEntryGroup[];
  description?: string;
  entries?: OrderEntry[];
  expirationTime?: Date;
  firstDate?: Date;
  guid?: string;
  name?: string;
  net?: boolean;
  orderDiscounts?: Price;
  paymentInfo?: PaymentDetails;
  paymentStatus?: string;
  paymentType?: B2BPaymentType;
  pickupItemsQuantity?: number;
  pickupOrderGroups?: PickupOrderEntryGroup[];
  potentialOrderPromotions?: PromotionResult[];
  potentialProductPromotions?: PromotionResult[];
  productDiscounts?: Price;
  purchaseOrderNumber?: string;
  replenishmentOrderCode?: string;
  saveTime?: Date;
  savedBy?: Principal;
  site?: string;
  store?: string;
  subTotal?: Price;
  totalDiscounts?: Price;
  totalItems?: number;
  totalPrice?: Price;
  totalPriceWithTax?: Price;
  totalTax?: Price;
  totalUnitCount?: number;
  user?: Principal;
}

export interface ReplenishmentOrderList {
  replenishmentOrders?: ReplenishmentOrder[];
  pagination?: PaginationModel;
  sorts?: SortModel[];
}

export interface ScheduleReplenishmentForm {
  daysOfWeek?: DaysOfWeek[];
  nthDayOfMonth?: string;
  numberOfDays?: string;
  numberOfWeeks?: string;
  recurrencePeriod?: string;
  replenishmentStartDate?: string;
}

export enum DaysOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export const recurrencePeriod = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
};

export enum ORDER_TYPE {
  PLACE_ORDER = 'PLACE_ORDER',
  SCHEDULE_REPLENISHMENT_ORDER = 'SCHEDULE_REPLENISHMENT_ORDER',
}
