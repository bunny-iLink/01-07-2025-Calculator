// evaluator.cpp
#include <iostream>
#include <string>
#include <stack>
#include <cctype>
#include <sstream>
#include <stdexcept>

int precedence(char op)
{
    if (op == '+' || op == '-')
        return 1;
    if (op == '*' || op == '/')
        return 2;
    return 0;
}

double applyOp(double a, double b, char op)
{
    switch (op)
    {
    case '+':
        return a + b;
    case '-':
        return a - b;
    case '*':
        return a * b;
    case '/':
        if (b == 0)
            throw std::runtime_error("Division by zero");
        return a / b;
    }
    throw std::runtime_error("Invalid operator");
}

void process(std::stack<double> &values, std::stack<char> &ops)
{
    double b = values.top();
    values.pop();
    double a = values.top();
    values.pop();
    char op = ops.top();
    ops.pop();
    values.push(applyOp(a, b, op));
}

double evaluateExpression(const std::string &expr)
{
    std::stack<double> values;
    std::stack<char> ops;
    std::istringstream input(expr);
    char ch;

    while (input >> std::ws >> ch)
    {
        if (isdigit(ch) || ch == '.')
        {
            input.putback(ch);
            double num;
            input >> num;
            values.push(num);
        }
        else if (ch == '(')
        {
            ops.push(ch);
        }
        else if (ch == ')')
        {
            while (!ops.empty() && ops.top() != '(')
            {
                process(values, ops);
            }
            if (!ops.empty())
                ops.pop(); // pop '('
        }
        else if (ch == '+' || ch == '-' || ch == '*' || ch == '/')
        {
            while (!ops.empty() && precedence(ops.top()) >= precedence(ch))
            {
                process(values, ops);
            }
            ops.push(ch);
        }
        else
        {
            throw std::runtime_error("Invalid character in expression");
        }
    }

    while (!ops.empty())
    {
        process(values, ops);
    }

    if (values.size() != 1)
        throw std::runtime_error("Invalid expression");

    return values.top();
}

int main(int argc, char *argv[])
{
    if (argc != 2)
    {
        std::cerr << "Usage: ./evaluator \"expression\"\n";
        return 1;
    }

    try
    {
        std::string expr = argv[1];
        double result = evaluateExpression(expr);
        std::cout << result << std::endl;
    }
    catch (const std::exception &ex)
    {
        std::cerr << "Error: " << ex.what() << std::endl;
        return 1;
    }

    return 0;
}
