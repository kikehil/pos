export declare enum PaymentMethod {
    CASH = "CASH",
    CARD = "CARD",
    TRANSFER = "TRANSFER"
}
export declare class CreateSaleItemDto {
    productId: string;
    variantId?: string;
    quantity: number;
    price: number;
}
export declare class CreateSaleDto {
    tenantId: string;
    total: number;
    paymentMethod: PaymentMethod;
    notes?: string;
    customerId?: string;
    receivedAmount?: number;
    changeAmount?: number;
    items: CreateSaleItemDto[];
}
