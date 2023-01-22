export function formDataToObject(form: FormData) {
  return Array.from(form.keys()).reduce(
    (acc, current) => ({ ...acc, [current]: form.get(current) }),
    {}
  ) as Record<string, string>
}
