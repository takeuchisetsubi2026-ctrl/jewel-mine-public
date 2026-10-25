#!/usr/bin/env python3
"""Read the package attribute from the binary protobuf manifest in an Android AAB.

No third-party dependencies. This verifies the packaged artifact, not merely
the Gradle configuration. It intentionally does not sign or upload anything.
"""
import pathlib
import sys
import zipfile


def varint(data, pos):
    value = 0
    for shift in range(0, 70, 7):
        if pos >= len(data):
            raise ValueError("Truncated protobuf varint")
        byte = data[pos]
        pos += 1
        value |= (byte & 0x7f) << shift
        if not byte & 0x80:
            return value, pos
    raise ValueError("Invalid protobuf varint")


def fields(data):
    pos = 0
    while pos < len(data):
        key, pos = varint(data, pos)
        number, wire = key >> 3, key & 7
        if number == 0:
            raise ValueError("Invalid protobuf field number")
        if wire == 0:
            value, pos = varint(data, pos)
        elif wire == 1:
            value = data[pos:pos + 8]
            pos += 8
        elif wire == 2:
            length, pos = varint(data, pos)
            value = data[pos:pos + length]
            if len(value) != length:
                raise ValueError("Truncated protobuf field")
            pos += length
        elif wire == 5:
            value = data[pos:pos + 4]
            pos += 4
        else:
            raise ValueError(f"Unsupported protobuf wire type {wire}")
        if pos > len(data):
            raise ValueError("Truncated protobuf fixed field")
        yield number, wire, value


def string_field(message, number):
    values = [value.decode("utf-8") for n, w, value in fields(message)
              if n == number and w == 2]
    return values[0] if values else None


def package_from_manifest(data):
    # XmlNode.element = field 3; XmlElement.name = field 3; XmlElement.attribute = field 4.
    elements = [v for n, w, v in fields(data) if n == 3 and w == 2]
    if len(elements) != 1:
        raise ValueError("AAB manifest must contain exactly one XmlElement")
    element = elements[0]
    if string_field(element, 3) != "manifest":
        raise ValueError("Root element is not <manifest>")
    for n, w, attribute in fields(element):
        if n == 4 and w == 2 and string_field(attribute, 2) == "package":
            value = string_field(attribute, 3)
            if not value:
                raise ValueError("Empty manifest package")
            return value
    raise ValueError("Package attribute not found")


def main():
    if len(sys.argv) != 3:
        raise SystemExit("usage: verify-aab-package.py <file.aab> <expected.package>")
    path, expected = pathlib.Path(sys.argv[1]), sys.argv[2]
    with zipfile.ZipFile(path) as bundle:
        actual = package_from_manifest(bundle.read("base/manifest/AndroidManifest.xml"))
    print(f"Packaged AAB application ID: {actual}")
    if actual != expected:
        raise SystemExit(f"FAIL: expected {expected}, got {actual}")
    print("AAB packaged application ID verified")


if __name__ == "__main__":
    main()
